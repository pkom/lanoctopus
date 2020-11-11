/**
 * GET /ldap/users
 * Users Ldap page.
 */
exports.getUsers = (req, res) => {
  res.render('ldap/users', {
    title: 'LDAP',
    subtitle: 'Usuarios'
  });
};

/**
 * GET /ldap/groups
 * Groups Ldap page.
 */
exports.getGroups = (req, res) => {
  res.render('ldap/groups', {
    title: 'LDAP',
    subtitle: 'Grupos'
  });
};