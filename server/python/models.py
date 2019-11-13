import datetime

import mongoengine


class Computer(mongoengine.DynamicDocument):
    name = mongoengine.StringField(unique=True, required=True)
    createdAt = mongoengine.DateTimeField()
    updatedAt = mongoengine.DateTimeField(default=datetime.datetime.now)
    lastInfoDatetime = mongoengine.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.createdAt:
            self.createdAt = datetime.datetime.now()
        self.updatedAt = datetime.datetime.now()
        return super(Computer, self).save(*args, **kwargs)
