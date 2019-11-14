class xubuntu_lanoctopus_client {

  addmayhave { "incluye python3-paho-mqtt":
    paquete => "python3-paho-mqtt"
  }

  addmayhave { "incluye python3-netifaces":
    paquete => "python3-netifaces"
  }

  package { "python3-paho-mqtt":
    ensure   => latest,
  }

  package { "python3-netifaces":
    ensure   => latest,
  }

  file { '/usr/local/bin/lanoctopus':
    ensure => 'directory',
    owner  => 'root',
    group  => 'root',
    mode   => '0775',
  }

  file { '/usr/local/bin/lanoctopus/certs':
    ensure => 'directory',
    owner  => 'root',
    group  => 'root',
    mode   => '0775',
    require => File['/usr/local/bin/lanoctopus'],
  }

  file { '/usr/local/bin/lanoctopus/certs/ca.crt':
    owner  => 'root',
    group  => 'root',
    mode   => '0775',
    source => "puppet:///modules/xubuntu_lanoctopus_client/ca.crt",
    require => File['/usr/local/bin/lanoctopus/certs']
  }

  file { '/usr/local/bin/lanoctopus/lanoctopus-client-log.py':
    mode    => '0755',
    owner   => 'root',
    group   => 'root',
    source => "puppet:///modules/xubuntu_lanoctopus_client/lanoctopus-client-log.py",
    require => [Package['python3-paho-mqtt'], Package['python3-netifaces'], File['/usr/local/bin/lanoctopus/certs/ca.crt']]
  }

  file { '/etc/lightdm/lightdm.conf.d/15-logout-lanoctopus.conf':
    ensure => absent,
#    mode    => '0644',
#    owner   => 'root',
#    group   => 'root',
#    source => "puppet:///modules/xubuntu_lanoctopus_client/15-logout-lanoctopus.conf",
#    require => File['/usr/local/bin/lanoctopus/lanoctopus-client-log.py']
  }

  file { '/usr/local/bin/lanoctopus/lanoctopus-client.py':
    mode    => '0755',
    owner   => 'root',
    group   => 'root',
    source => "puppet:///modules/xubuntu_lanoctopus_client/lanoctopus-client.py",
    require => [Package['python3-paho-mqtt'], Package['python3-netifaces'], File['/usr/local/bin/lanoctopus/certs/ca.crt']]
  }

  file { '/etc/profile.d/lanoctopus-login.sh':
    mode    => '0644',
    owner   => 'root',
    group   => 'root',
    source => "puppet:///modules/xubuntu_lanoctopus_client/lanoctopus-login.sh",
    require => File['/usr/local/bin/lanoctopus/lanoctopus-client-log.py']
  }

  file { '/etc/X11/Xsession.d/99lanoctopus':
    ensure  => absent,
#    mode    => '0644',
#    owner   => 'root',
#    group   => 'root',
#    source => "puppet:///modules/xubuntu_lanoctopus_client/lanoctopus-login.sh",
#    require => File['/usr/local/bin/lanoctopus/lanoctopus-client-log.py']
  }

  line { "Execute script on logout":
    file => '/etc/bash.bash_logout',
    line => '/usr/local/bin/lanoctopus/lanoctopus-client-log.py out',
    ensure => 'present',
    require => File['/usr/local/bin/lanoctopus/lanoctopus-client-log.py']
  }

  file { '/etc/xdg/xfce4/xinitrc':
    mode    => '0755',
    owner   => 'root',
    group   => 'root',
    backup  => 'true',
    content => template('xubuntu_lanoctopus_client/xinitrc.erb'),
    require => File['/usr/local/bin/lanoctopus/lanoctopus-client-log.py']
  }

  file { '/lib/systemd/system/lanoctopus-client.service':
    mode    => '0644',
    owner   => 'root',
    group   => 'root',
    content => template('xubuntu_lanoctopus_client/lanoctopus-client.service.erb'),
    require => [Package['python3-paho-mqtt'], Package['python3-netifaces']]
  }~>
  exec { 'lanoctopus-client-systemd-reload':
    command     => 'systemctl daemon-reload',
    path        => [ '/usr/bin', '/bin', '/usr/sbin' ],
    subscribe   => File[ '/usr/local/bin/lanoctopus/lanoctopus-client.py' ],
    refreshonly => true,
  }~>
  service { 'lanoctopus-client':
    ensure   => running,
    enable   => true,
    provider => systemd,
  }

}
