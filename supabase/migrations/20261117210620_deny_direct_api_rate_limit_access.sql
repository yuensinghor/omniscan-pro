create policy "No direct access to API rate limits"
on private.api_rate_limits
for all to public
using (false)
with check (false);
