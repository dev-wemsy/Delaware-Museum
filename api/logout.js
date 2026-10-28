// Clears the portal session and returns to the login page.
module.exports = (req, res) => {
  res.setHeader('Set-Cookie', [
    'dmm_portal=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    'dmm_role=; Path=/; SameSite=Lax; Max-Age=0',
  ]);
  res.redirect(303, '/portal/login?out=1');
};
