-- ThisfileshallcontaintheSQLscriptusedtoinitializethedatabase.​database_helper.pyorSQLite3front-endwillusethisfiletocreateallthetablesandinsertthedefaultdata.Thisfileshouldbecompleted
-- and executed before implementing and running any of the server​ side
-- procedures

.open database.db
drop table if exists users;
drop table if exists messages;
create table users
(
       username varchar(30) primary key,
       password varchar(30),
       first_name varchar(30),
       family_name varchar(30),
       gender varchar(6),
       city varchar(30),
       country varchar(30)
);

create table messages
(      
	from_user varchar(30),
	to_user varchar(30),
	message text,

	foreign key (from_user) references users(username)
);

-- insert into users(username,password,first_name,family_name,gender,city,country) values("lukas","qwerty","luk","poh","female","linkoping","sweden");

-- select * from users;

-- insert into messages(from_user, to_user, message) values("lukas", "mackan", "tjabba, mackan!");

-- select * from messages;

-- .tables
