-- drop database chat;
CREATE DATABASE chat;

USE chat;
CREATE TABLE rooms (
  roomId varChar(24),
  -- messageId int,
  PRIMARY KEY (roomId)
  -- FOREIGN KEY (messageId) REFERENCES messages(messageId)
);

CREATE TABLE users (
  userId varchar(24),
  -- messageId int,
  PRIMARY KEY (userId)
  -- FOREIGN KEY (messageId) REFERENCES messages(messageId)
);

CREATE TABLE messages (
  /* Describe your table here.*/
  messageId int,
  messageText text,
  roomId varchar(24),
  userId varchar(24),
  PRIMARY KEY (messageId),
  FOREIGN KEY (roomId) REFERENCES rooms(roomId),
  FOREIGN KEY (userId) REFERENCES users(userId)
);

/* Create other tables and define schemas for them here! */




/*  Execute this file from the command line by typing:
 *    mysql < schema.sql
 *  to create the database and the tables.*/




