BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "USERS" (
    uid       INTEGER PRIMARY KEY AUTOINCREMENT,       
    name      VARCHAR(100),
    email     VARCHAR(100),
    pwdh      VARCHAR(16),
    salt 	  VARCHAR(64));

CREATE TABLE IF NOT EXISTS "FILMS" (
    fid        INTEGER PRIMARY KEY AUTOINCREMENT,
    title	   VARCHAR(100),
    owner      INTEGER,
    private    INTEGER,
    watchDate  DATE,
    rating     INTEGER,
    favorite   INTEGER,
    FOREIGN KEY (owner) REFERENCES USERS(uid));

CREATE TABLE IF NOT EXISTS "REVIEWS" (
    fid        INTEGER,
    uid        INTEGER,
    completed  INTEGER,
    reviewDate DATE,
    rating     INTEGER,
    review     VARCHAR(1000),
    PRIMARY KEY (fid, uid),
    FOREIGN KEY (fid) REFERENCES FILMS(fid),
    FOREIGN KEY (uid) REFERENCES USERS(uid));

CREATE TABLE IF NOT EXISTS "IMAGES" (
    iid         INTEGER PRIMARY KEY AUTOINCREMENT,
    fid         INTEGER,
    format      VARCHAR(20),
    name        VARCHAR(1000), 
    -- The name of the image is nothing the image path
    -- in the file system
    FOREIGN KEY (fid) REFERENCES FILMS(fid));



-- PWD = pwd for all users
INSERT INTO "USERS" (name, email, salt, pwdh) VALUES ('user1','user1@test.com', '123348dusd437840', 'bddfdc9b092918a7f65297b4ba534dfe306ed4d5d72708349ddadb99b1c526fb');
INSERT INTO "USERS" (name, email, salt, pwdh) VALUES ('user2','user2@test.com', '7732qweydg3sd637', '498a8d846eb4efebffc56fc0de16d18905714cf12edf548b8ed7a4afca0f7c1c');
INSERT INTO "USERS" (name, email, salt, pwdh) VALUES ('user3','user3@test.com', 'wgb32sge2sh7hse7', '09a79c91c41073e7372774fcb114b492b2b42f5e948c61d775ad4f628df0e160');
INSERT INTO "USERS" (name, email, salt, pwdh) VALUES ('user4','harry@test.com', 'safd6523tdwt82et', '330f9bd2d0472e3ca8f11d147d01ea210954425a17573d0f6b8240ed503959f8');

-- Image1
INSERT INTO IMAGES (fid, format, name) VALUES (1, 'image/jpg', 'image_1.jpg');
-- Image2
INSERT INTO IMAGES (fid, format, name) VALUES (2, 'image/jpg', 'image_2.png');
-- Image3
INSERT INTO IMAGES (fid, format, name) VALUES (1, 'image/jpg', 'image_3.jpg');
-- Image 4
INSERT INTO IMAGES (fid, format, name) VALUES (3, 'image/jpg', 'image_4.jpg');
-- Image 5
INSERT INTO IMAGES (fid, format, name) VALUES (2, 'image/png', 'image_4.png');

-- Film 1 (Not Private)
INSERT INTO "FILMS" (title, owner, private, watchDate, rating, favorite) VALUES ("The Gladiator", 1, 0, "2023-11-01", 8, 1);
-- Film 2 (Private)
INSERT INTO "FILMS" (title, owner, private, watchDate, rating, favorite) VALUES ("Inception", 2, 1, "2023-11-02", 7, 0);
-- Film 3 (Private)
INSERT INTO "FILMS" (title, owner, private, watchDate, rating, favorite) VALUES ("Rambo", 1, 1, "2023-11-03", 9, 1);
-- Film 4 (Private)
INSERT INTO "FILMS" (title, owner, private, watchDate, rating, favorite) VALUES ("Rocky IV", 3, 1, "2023-11-04", 6, 0);
-- Film 5 (Not Private)
INSERT INTO "FILMS" (title, owner, private, watchDate, rating, favorite) VALUES ("Enemy at the Gates", 2, 0, NULL, NULL, NULL);
-- Film 6 (Not Private)
INSERT INTO "FILMS" (title, owner, private, watchDate, rating, favorite) VALUES ("The Big Red One", 1, 0, NULL, NULL, NULL);
-- Film 7 (Not Private)
INSERT INTO "FILMS" (title, owner, private, watchDate, rating, favorite) VALUES ("Scary Movie 2", 4, 0, NULL, NULL, NULL);
-- Film 8 (Not Private)
INSERT INTO "FILMS" (title, owner, private, watchDate, rating, favorite) VALUES ("American Horror Story", 3, 0, NULL, NULL, NULL);
-- Film 9 (Not Private)
INSERT INTO "FILMS" (title, owner, private, watchDate, rating, favorite) VALUES ("Jaws", 5, 0, NULL, NULL, NULL);
-- Film 10 (Not Private)
INSERT INTO "FILMS" (title, owner, private, watchDate, rating, favorite) VALUES ("Joker", 4, 0, NULL, NULL, NULL);

-- Review 1 (Completed)
INSERT INTO "REVIEWS" (fid, uid, completed, reviewDate, rating, review) VALUES (1, 1, 0, "2023-11-01", 5, "A great movie with an interesting plot.");
-- Review 2 (Completed)
INSERT INTO "REVIEWS" (fid, uid, completed, reviewDate, rating, review) VALUES (1, 2, 1, "2023-11-02", 8, "Loved it! The acting was superb.");
-- Review 3 (Completed)
INSERT INTO "REVIEWS" (fid, uid, completed, reviewDate, rating, review) VALUES (2, 1, 1, "2023-11-03", 7, "A good movie, but it could have been better.");
-- Review 4 (Completed)
INSERT INTO "REVIEWS" (fid, uid, completed, reviewDate, rating, review) VALUES (2, 3, 1, "2023-11-04", 6, "It was okay, nothing special.");
-- Review 5 (Completed)
INSERT INTO "REVIEWS" (fid, uid, completed, reviewDate, rating, review) VALUES (3, 2, 1, "2023-11-05", 9, "One of the best movies I have ever seen.");
-- Review 6 (Completed)
INSERT INTO "REVIEWS" (fid, uid, completed, reviewDate, rating, review) VALUES (3, 1, 1, "2023-11-06", 8, "Highly recommended!");
-- Review 7 (Not Completed)
INSERT INTO "REVIEWS" (fid, uid, completed) VALUES (4, 4, 0);
-- Review 8 (Not Completed)
INSERT INTO "REVIEWS" (fid, uid, completed) VALUES (4, 3, 0);
-- Review 9 (Not Completed)
INSERT INTO "REVIEWS" (fid, uid, completed) VALUES (5, 5, 0);
-- Review 10 (Not Completed)
INSERT INTO "REVIEWS" (fid, uid, completed) VALUES (5, 4, 0);


COMMIT;
