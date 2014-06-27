CREATE DATABASE chat;

USE chat;
CREATE TABLE rooms (
  roomId int,
  roomName varchar(24),
  PRIMARY KEY (roomId)
);

CREATE TABLE users (
  userId int,
  username varchar(24),
  PRIMARY KEY (userId)
);

CREATE TABLE messages (
  /* Describe your table here.*/
  messageId int,
  messageText text,
  roomId int,
  userId int,
  PRIMARY KEY (messageId),
  FOREIGN KEY (roomId) REFERENCES rooms(roomId),
  FOREIGN KEY (userId) REFERENCES users(userId)
);


CREATE TABLE roomUserJoin (
  roomId int,
  userId int,
  FOREIGN KEY (roomId) REFERENCES rooms(roomId),
  FOREIGN KEY (userId) REFERENCES users(userId)
);

/* Create other tables and define schemas for them here! */




/*  Execute this file from the command line by typing:
 *    mysql < schema.sql
 *  to create the database and the tables.*/




