import datetime

import mongoengine


class Computer(mongoengine.DynamicDocument):
    name = mongoengine.StringField(unique=True, required=True)
    createdAt = mongoengine.DateTimeField()
    updatedAt = mongoengine.DateTimeField(default=datetime.datetime.now)
    lastInfoDatetime = mongoengine.DateTimeField()
    online = mongoengine.BooleanField()

    def save(self, *args, **kwargs):
        if not self.createdAt:
            self.createdAt = datetime.datetime.now()
        self.updatedAt = datetime.datetime.now()
        return super(Computer, self).save(*args, **kwargs)

class User(mongoengine.DynamicDocument):
    name = mongoengine.StringField(unique=True, required=True)
    online = mongoengine.BooleanField()
    createdAt = mongoengine.DateTimeField()
    updatedAt = mongoengine.DateTimeField(default=datetime.datetime.now)

    def save(self, *args, **kwargs):
        if not self.createdAt:
            self.createdAt = datetime.datetime.now()
        self.updatedAt = datetime.datetime.now()
        return super(User, self).save(*args, **kwargs)

class LogComputer(mongoengine.DynamicDocument):
    computer = mongoengine.ReferenceField(Computer, reverse_delete_rule=mongoengine.DO_NOTHING)
    status = mongoengine.StringField(required=True, choices=('starting up', 'shutting down'))
    at = mongoengine.DateTimeField(default=datetime.datetime.now)

class LogUser(mongoengine.DynamicDocument):
    computer = mongoengine.ReferenceField(Computer, reverse_delete_rule=mongoengine.DO_NOTHING)
    user = mongoengine.ReferenceField(User, reverse_delete_rule=mongoengine.DO_NOTHING)
    action = mongoengine.StringField(required=True, choices=('login', 'logout'))
    at = mongoengine.DateTimeField(default=datetime.datetime.now)
