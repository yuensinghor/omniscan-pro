// src/i18n.ts
// Language preference stored in AsyncStorage under key 'app_lang'
// Falls back to device locale if no preference saved.
// Changing language triggers app reload via expo-updates.

import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// expo-updates is optional — gracefully handle if not installed
let Updates: any = null;
try { Updates = require('expo-updates'); } catch {}

export type Lang = 'en' | 'de';
export const LANG_KEY = 'app_lang';

const translations = {
  en: {
    // Language
    language:           'Language',
    langEnglish:        '🇬🇧 English',
    langGerman:         '🇩🇪 Deutsch',
    langRestartTitle:   'Language Changed',
    langRestartMsg:     'The app will restart to apply the new language.',
    langRestart:        'Restart Now',
    // Dashboard
    searchPlaceholder:  'Search items or barcodes…',
    allCategories:      'All',
    outOfStock:         '📦 Out of Stock',
    items:              'items',
    noItemsFound:       'NO ITEMS FOUND',
    allInStock:         'ALL IN STOCK',
    scanIn:             'SCAN IN',
    scanOut:            'SCAN OUT',
    lookup:             'LOOKUP',
    addOne:             'Add 1',
    removeOne:          'Remove 1',
    addOneOf:           (name: string) => `Add 1 unit of ${name}?`,
    removeOneOf:        (name: string) => `Remove 1 unit of ${name}?`,
    confirm:            'Confirm',
    cancel:             'Cancel',
    setQuantity:        'Set Quantity',
    outOfStockAlert:    'Out of Stock',
    cannotReduceBelow:  'Cannot reduce quantity below 0.',
    undo:               'Undo',
    errorUpdateQty:     'Could not update quantity. Please try again.',
    errorUndo:          'Could not undo the last action. Please adjust manually.',
    errorShare:         'Could not create share link. Please try again.',
    // Edit item
    editItem:           'Edit Item',
    itemDetails:        'Item Details',
    productName:        'PRODUCT NAME',
    category:           'CATEGORY',
    currentStock:       'CURRENT STOCK',
    units:              'units',
    barcode:            'BARCODE',
    saveChanges:        'SAVE CHANGES',
    shareProduct:       '↗  Share this product',
    changePhoto:        '📷  Change Photo',
    unsavedPhoto:       '⚠️  Unsaved — tap SAVE CHANGES',
    tapToAddPhoto:      'Tap to add photo',
    removeItem:         'Remove Item',
    removeItemMsg:      'This will remove the item and all its history from your inventory.',
    remove:             'Remove',
    saveFailed:         'Could not save changes. Please try again.',
    deleteFailed:       'Could not remove item. Please try again.',
    galleryError:       'Could not open photo gallery. Please check app permissions.',
    shareUnavailable:   'Could not create share link. Please try again.',
    permissionDenied:   'Allow Photos in Settings → Apps → OmniScan Pro → Permissions.',
    // Profile
    account:            'Account',
    displayName:        'DISPLAY NAME',
    addScanner:         'Add Scanner',
    activityLog:        'Activity Log',
    feedback:           'Feedback',
    familySharing:      'Family Sharing',
    buyMeCoffee:        'Buy Me a Coffee',
    supportDev:         'Support development · PayPal donation',
    inviteMembers:      'Invite members · Manage access',
    signOut:            'Sign Out',
    signOutConfirm:     'Are you sure you want to sign out?',
    comingSoonTitle:    '🚧 Coming Soon',
    comingSoonMsg:      'This feature is under development and will be available in the official release.',
    profilePhoto:       'Profile Photo',
    uploadFromGallery:  'Upload from Gallery',
    randomAvatar:       'Random Avatar',
    shareFeedback:      'Share Your Feedback',
    feedbackPlaceholder:'Type your feedback here…',
    sendFeedback:       'Send Feedback',
    thankYou:           '🎉 Thank you!',
    feedbackThanks:     'Your feedback helps us build a better app.',
    backToAccount:      'Back to Account',
    feedbackPrompt:     "We'd love to hear from you 👋",
    feedbackSub:        'What features would you like to see? Any bugs or issues? Tell us anything!',
    uploadFailed:       'Could not update profile photo. Please try again.',
    // History
    activityLogTitle:   'Activity Log',
    inventoryHistory:   'YOUR INVENTORY HISTORY',
    noActivity:         'No activity yet',
    // Exit
    exitTitle:          'Exit OmniScan Pro',
    exitMsg:            'Are you sure you want to exit?',
    exit:               'Exit',
    // Family sharing
    familySharingTitle: 'Family Sharing',
    addMember:          'Add a Member',
    addMemberSub:       "Enter their email. Once they sign in with that email, they can access your inventory.",
    addMemberBtn:       '＋  Add Member',
    currentMembers:     'Current Members',
    added:              'Added',
    youreSharing:       "YOU'RE SHARING",
    leaveWorkspace:     'Leave Workspace',
    leaveWorkspaceMsg:  'You will return to your own inventory.',
    leave:              'Leave',
    noMembersYet:       'No members yet',
    noMembersSub:       "Add someone's email above to share your inventory with them.",
    inviteSuccess:      (email: string) => `${email} can now log in and access your inventory.`,
    invalidEmail:       'Please enter a valid email address.',
    inviteFailed:       'Invite failed',
    removeMember:       'Remove Member',
    removeConfirm:      (email: string) => `Remove ${email}?`,
    ok:                 'OK',
  },

  de: {
    // Language
    language:           'Sprache',
    langEnglish:        '🇬🇧 English',
    langGerman:         '🇩🇪 Deutsch',
    langRestartTitle:   'Sprache geändert',
    langRestartMsg:     'Die App wird neu gestartet, um die neue Sprache anzuwenden.',
    langRestart:        'Jetzt neu starten',
    // Dashboard
    searchPlaceholder:  'Artikel oder Barcodes suchen…',
    allCategories:      'Alle',
    outOfStock:         '📦 Nicht vorrätig',
    items:              'Artikel',
    noItemsFound:       'KEINE ARTIKEL GEFUNDEN',
    allInStock:         'ALLES VORRÄTIG',
    scanIn:             'EINBUCHEN',
    scanOut:            'AUSBUCHEN',
    lookup:             'SUCHEN',
    addOne:             '1 hinzufügen',
    removeOne:          '1 entfernen',
    addOneOf:           (name: string) => `1 Einheit von ${name} hinzufügen?`,
    removeOneOf:        (name: string) => `Remove 1 unit of ${name}?`,
    confirm:            'Bestätigen',
    cancel:             'Abbrechen',
    setQuantity:        'Menge festlegen',
    outOfStockAlert:    'Nicht vorrätig',
    cannotReduceBelow:  'Menge kann nicht unter 0 reduziert werden.',
    undo:               'Rückgängig',
    errorUpdateQty:     'Menge konnte nicht aktualisiert werden. Bitte erneut versuchen.',
    errorUndo:          'Rückgängig fehlgeschlagen. Bitte manuell anpassen.',
    errorShare:         'Link konnte nicht erstellt werden. Bitte erneut versuchen.',
    // Edit item
    editItem:           'Artikel bearbeiten',
    itemDetails:        'Artikeldetails',
    productName:        'PRODUKTNAME',
    category:           'KATEGORIE',
    currentStock:       'AKTUELLER BESTAND',
    units:              'Einheiten',
    barcode:            'BARCODE',
    saveChanges:        'ÄNDERUNGEN SPEICHERN',
    shareProduct:       '↗  Produkt teilen',
    changePhoto:        '📷  Foto ändern',
    unsavedPhoto:       '⚠️  Nicht gespeichert — SPEICHERN tippen',
    tapToAddPhoto:      'Tippen um Foto hinzuzufügen',
    removeItem:         'Artikel entfernen',
    removeItemMsg:      'Der Artikel und sein gesamter Verlauf werden aus dem Inventar entfernt.',
    remove:             'Entfernen',
    saveFailed:         'Änderungen konnten nicht gespeichert werden. Bitte erneut versuchen.',
    deleteFailed:       'Artikel konnte nicht entfernt werden. Bitte erneut versuchen.',
    galleryError:       'Fotogalerie konnte nicht geöffnet werden. Bitte Berechtigungen prüfen.',
    shareUnavailable:   'Freigabelink konnte nicht erstellt werden. Bitte erneut versuchen.',
    permissionDenied:   'Fotos erlauben unter Einstellungen → Apps → OmniScan Pro → Berechtigungen.',
    // Profile
    account:            'Konto',
    displayName:        'ANZEIGENAME',
    addScanner:         'Scanner hinzufügen',
    activityLog:        'Aktivitätsprotokoll',
    feedback:           'Feedback',
    familySharing:      'Familienfreigabe',
    buyMeCoffee:        'Kauf mir einen Kaffee',
    supportDev:         'Entwicklung unterstützen · PayPal-Spende',
    inviteMembers:      'Mitglieder einladen · Zugang verwalten',
    signOut:            'Abmelden',
    signOutConfirm:     'Möchten Sie sich wirklich abmelden?',
    comingSoonTitle:    '🚧 Demnächst verfügbar',
    comingSoonMsg:      'Diese Funktion ist noch in der Entwicklung und wird mit der offiziellen Version verfügbar sein.',
    profilePhoto:       'Profilfoto',
    uploadFromGallery:  'Aus Galerie hochladen',
    randomAvatar:       'Zufälliger Avatar',
    shareFeedback:      'Feedback teilen',
    feedbackPlaceholder:'Feedback hier eingeben…',
    sendFeedback:       'Feedback senden',
    thankYou:           '🎉 Danke!',
    feedbackThanks:     'Ihr Feedback hilft uns, die App zu verbessern.',
    backToAccount:      'Zurück zum Konto',
    feedbackPrompt:     'Wir freuen uns auf Ihr Feedback 👋',
    feedbackSub:        'Welche Funktionen möchten Sie sehen? Fehler oder Probleme? Schreiben Sie uns!',
    uploadFailed:       'Profilfoto konnte nicht aktualisiert werden. Bitte erneut versuchen.',
    // History
    activityLogTitle:   'Aktivitätsprotokoll',
    inventoryHistory:   'IHR INVENTARVERLAUF',
    noActivity:         'Noch keine Aktivität',
    // Exit
    exitTitle:          'OmniScan Pro beenden',
    exitMsg:            'Möchten Sie die App wirklich beenden?',
    exit:               'Beenden',
    // Family sharing
    familySharingTitle: 'Familienfreigabe',
    addMember:          'Mitglied hinzufügen',
    addMemberSub:       'E-Mail eingeben. Sobald sie sich mit dieser E-Mail anmelden, können sie auf Ihr Inventar zugreifen.',
    addMemberBtn:       '＋  Mitglied hinzufügen',
    currentMembers:     'Aktuelle Mitglieder',
    added:              'Hinzugefügt',
    youreSharing:       'SIE TEILEN GERADE',
    leaveWorkspace:     'Arbeitsbereich verlassen',
    leaveWorkspaceMsg:  'Sie kehren zu Ihrem eigenen Inventar zurück.',
    leave:              'Verlassen',
    noMembersYet:       'Noch keine Mitglieder',
    noMembersSub:       'Fügen Sie oben eine E-Mail-Adresse hinzu, um Ihr Inventar zu teilen.',
    inviteSuccess:      (email: string) => `${email} kann sich jetzt anmelden und auf Ihr Inventar zugreifen.`,
    invalidEmail:       'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    inviteFailed:       'Einladung fehlgeschlagen',
    removeMember:       'Mitglied entfernen',
    removeConfirm:      (email: string) => `${email} entfernen?`,
    ok:                 'OK',
  },
};

// ─── Sync lang detection (runs at module load) ────────────────────────────────
// AsyncStorage is async so we read device locale synchronously as default,
// then the app calls initLang() on startup to override with saved preference.

function detectDeviceLang(): Lang {
  try {
    const locale =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager?.settings?.AppleLocale ||
          NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] || 'en'
        : NativeModules.I18nManager?.localeIdentifier || 'en';
    return locale.toLowerCase().startsWith('de') ? 'de' : 'en';
  } catch {
    return 'en';
  }
}

// Mutable lang state — updated by initLang()
let _lang: Lang = detectDeviceLang();

export function getLang(): Lang { return _lang; }
export let t = translations[_lang];

// ─── Call this once in App.tsx on startup ─────────────────────────────────────
export async function initLang(): Promise<Lang> {
  try {
    const saved = await AsyncStorage.getItem(LANG_KEY) as Lang | null;
    if (saved === 'en' || saved === 'de') {
      _lang = saved;
      t     = translations[_lang];
    }
  } catch {}
  return _lang;
}

// ─── Call this when user switches language ────────────────────────────────────
export async function setLang(newLang: Lang): Promise<void> {
  await AsyncStorage.setItem(LANG_KEY, newLang);
  // Reload app to apply new language throughout
  if (Updates?.reloadAsync) {
    await Updates.reloadAsync();
  } else {
    // Dev environment without expo-updates — inform developer
    console.warn('[i18n] expo-updates not available. Language saved. Restart app manually to apply.');
  }
}
