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
    uid        INTEGER,
    isPrivate  INTEGER,
    watchDate  DATE,
    rating     INTEGER,
    favorite   INTEGER,
    FOREIGN KEY (uid) REFERENCES USERS(uid));

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

-- PWD = pwd
INSERT INTO "USERS" (name, email, salt, pwdh) VALUES ('user1','user1@test.com', '123348dusd437840', 'bddfdc9b092918a7f65297b4ba534dfe306ed4d5d72708349ddadb99b1c526fb');
INSERT INTO "USERS" (name, email, salt, pwdh) VALUES ('user2','user2@test.com', '7732qweydg3sd637', '498a8d846eb4efebffc56fc0de16d18905714cf12edf548b8ed7a4afca0f7c1c');
INSERT INTO "USERS" (name, email, salt, pwdh) VALUES ('user3','user3@test.com', 'wgb32sge2sh7hse7', '09a79c91c41073e7372774fcb114b492b2b42f5e948c61d775ad4f628df0e160');
INSERT INTO "USERS" (name, email, salt, pwdh) VALUES ('user4','user4@test.com', 'safd6523tdwt82et', '330f9bd2d0472e3ca8f11d147d01ea210954425a17573d0f6b8240ed503959f8');

-- Istruzioni per la creazione di x films

-- Film 1 (isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("Il Padrino", 1, 1, "2023-11-01", 8, 1);
-- Film 2 (isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("Titanic", 2, 1, "2023-11-02", 7, 0);
-- Film 3 (isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("La La Land", 1, 0, "2023-11-03", 9, 1);
-- Film 4 (isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("Inception", 3, 1, "2023-11-04", 6, 0);
-- Film 5 (Not isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("Il Signore degli Anelli: La Compagnia dell'Anello", 2, 0, NULL, NULL, NULL);
-- Film 6 (Not isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("Forrest Gump", 1, 0, NULL, NULL, NULL);
-- Film 7 (Not isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("Pulp Fiction", 4, 0, NULL, NULL, NULL);
-- Film 8 (Not isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("L'era glaciale", 3, 0, NULL, NULL, NULL);
-- Film 9 (Not isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("Caccia a Ottobre Rosso", 5, 0, NULL, NULL, NULL);
-- Film 10 (Not isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("La forma dell'acqua", 4, 0, NULL, NULL, NULL);
-- Film 11 (isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("Matrix", 2, 1, "2023-11-05", 8, 1);
-- Film 12 (isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("The Shawshank Redemption", 3, 1, "2023-11-06", 9, 1);
-- Film 13 (isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("The Dark Knight", 5, 1, "2023-11-07", 9, 1);
-- Film 14 (Not isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("The Godfather: Part II", 1, 0, NULL, NULL, NULL);
-- Film 15 (Not isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("Schindler's List", 2, 0, NULL, NULL, NULL);
-- Film 16 (Not isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("The Silence of the Lambs", 3, 0, NULL, NULL, NULL);
-- Film 17 (isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("Gladiator", 4, 1, "2023-11-08", 7, 0);
-- Film 18 (isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("The Departed", 5, 1, "2023-11-09", 8, 1);
-- Film 19 (Not isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("The Matrix Reloaded", 2, 0, NULL, NULL, NULL);
-- Film 20 (Not isPrivate)
INSERT INTO "FILMS" (title, uid, isPrivate, watchDate, rating, favorite) VALUES ("Braveheart", 1, 0, NULL, NULL, NULL);

-- Review 1 (Completed)
INSERT INTO "REVIEWS" (fid, uid, completed, reviewDate, rating, review) VALUES (3, 1, 0, "2023-11-01", 5, "A great movie with an interesting plot.");
-- Review 2 (Completed)
INSERT INTO "REVIEWS" (fid, uid, completed, reviewDate, rating, review) VALUES (3, 2, 1, "2023-11-02", 8, "Loved it! The acting was superb.");
-- Review 3 (Completed)
INSERT INTO "REVIEWS" (fid, uid, completed, reviewDate, rating, review) VALUES (3, 4, 1, "2023-11-03", 7, "A good movie, but it could have been better.");
-- Review 4 (Completed)
INSERT INTO "REVIEWS" (fid, uid, completed, reviewDate, rating, review) VALUES (3, 5, 1, "2023-11-04", 6, "It was okay, nothing special.");
-- Review 5 (Completed)
INSERT INTO "REVIEWS" (fid, uid, completed, reviewDate, rating, review) VALUES (4, 2, 1, "2023-11-05", 9, "One of the best movies I have ever seen.");
-- Review 6 (Completed)
INSERT INTO "REVIEWS" (fid, uid, completed, reviewDate, rating, review) VALUES (6, 1, 1, "2023-11-06", 8, "Highly recommended!");
-- Review 7 (Not Completed)
INSERT INTO "REVIEWS" (fid, uid, completed, reviewDate, rating, review) VALUES (7, 1, 0, NULL, NULL, NULL);
-- Review 8 (Not Completed)
INSERT INTO "REVIEWS" (fid, uid, completed, reviewDate, rating, review) VALUES (8, 2, 0, NULL, NULL, NULL);
-- Review 9 (Not Completed)
INSERT INTO "REVIEWS" (fid, uid, completed, reviewDate, rating, review) VALUES (9, 3, 0, NULL, NULL, NULL);
-- Review 10 (Not Completed)
INSERT INTO "REVIEWS" (fid, uid, completed, reviewDate, rating, review) VALUES (1, 2, 0, NULL, NULL, NULL);
COMMIT;