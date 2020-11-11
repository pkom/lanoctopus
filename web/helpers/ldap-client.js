const LdapClient = require('ldapjs-client');

const url = process.env.PASSPORT_LDAP_URL;
const bindDn = process.env.PASSPORT_LDAP_BINDDN;
const bindPass = process.env.PASSPORT_LDAP_BINDCREDENTIALS;

const FILTERS = {
  USERS: '(objectClass=posixAccount)',
  USER: (username) => `(&(objectClass=posixAccount)(uid=${username}))`,
  GROUPS: '(&(objectClass=posixGroup)(|(groupType=school_class)(groupType=school_department)))'
}

const SEARCHBASES = {
  USERS: 'ou=People,dc=instituto,dc=extremadura,dc=es',
  GROUPS: 'ou=Group,dc=instituto,dc=extremadura,dc=es'
}

const USERATTRIBUTES = ['dn', 'uid', 'sn', 'cn', 'dialupAccess', 'employeeNumber', 'uidNumber', 'gidNumber', 'givenName', 'radiusGroupName', 'jpegPhoto', 'homeDirectory'];
const GROUPATTRIBUTES = ['dn', 'cn', 'groupType', 'member', 'memberUid', 'gidNumber'];

const options = {
  filter: FILTERS.USERS,
  scope: 'sub',
  attributes: USERATTRIBUTES
};

async function getUsers() {
  const client = new LdapClient({ url: url });
  await client.bind(bindDn, bindPass);
  return await client.search(SEARCHBASES.USERS, options);
}

async function getUser(username) {
  const client = new LdapClient({ url: url });
  await client.bind(bindDn, bindPass);
  return await client.search(SEARCHBASES.USERS, Object.assign(options, { filter: FILTERS.USER(username) }));
}

async function getGroups() {
  const client = new LdapClient({ url: url });
  await client.bind(bindDn, bindPass);
  return await bind.search(SEARCHBASES.GROUPS, Object.assign(options, { filter: FILTERS.GROUPS, attributes: GROUPATTRIBUTES }));
}

module.exports = {
  getUsers,
  getUser,
  getGroups
}