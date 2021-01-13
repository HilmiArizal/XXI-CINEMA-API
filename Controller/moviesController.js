const database = require("../Database");
const { uploader } = require("../Helper/uploader-img");
const fs = require('fs');


module.exports = {
    getMovies: (req, res) => {
        const queryGetMovies = `SELECT * FROM movies`;
        database.query(queryGetMovies, (err, resultsGetMovies) => {
            if (err) return res.status(500).send(err)

            res.status(200).send(resultsGetMovies)
        })
    },
    getMoviesById: (req, res) => {
        const queryGetMoviesById = `SELECT * FROM movies WHERE idmovies = ${req.query.idmovies}`;
        database.query(queryGetMoviesById, (err, resultsGetMoviesById) => {
            if (err) return res.status(500).send(err)

            res.status(200).send(resultsGetMoviesById)
        })
    },
    getBestMovies: (req, res) => {
        const queryGetBestMovies = `SELECT * FROM movies LIMIT 3`;
        database.query(queryGetBestMovies, (err, resultsGetBestMovies) => {
            if (err) return res.status(500).send(err)

            res.status(200).send(resultsGetBestMovies)
        })
    },
    addMovies: (req, res) => {
        const path = '/imagemovies';
        const upload = uploader(path, 'IMG').fields([{ name: 'imageMovies' }]);
        upload(req, res, (err) => {
            if (err) return res.status(500).send(err);

            const { imageMovies } = req.files;
            const imagePath = imageMovies ? path + '/' + imageMovies[0].filename : null

            const data = JSON.parse(req.body.dataMovies)
            data.imagemovies = imagePath;
            console.log(data)

            const queryPostMovies = `INSERT INTO movies SET ?`;
            database.query(queryPostMovies, data, (err, resultsPostMovies) => {
                if (err) return res.status(500).send(err)

                res.status(200).send(resultsPostMovies)
            })
        })
    },
    deleteMovies: (req, res) => {
        const queryGetMovies = `SELECT * FROM movies WHERE idmovies = ${req.query.idmovies}`;
        database.query(queryGetMovies, (err, resultsGetMovies) => {
            if (err) return res.status(500).send(err)

            const queryDeleteMovies = `DELETE FROM movies WHERE idmovies = ${req.query.idmovies}`;
            database.query(queryDeleteMovies, (err, resultsDeleteMovies) => {
                if (err) return res.status(500).send(err)


                fs.unlinkSync('./Public' + resultsGetMovies[0].imagemovies);
                res.status(200).send(resultsDeleteMovies)
            })
        })
    },
    editMovies: (req, res) => {
        try {
            const path = '/imagemovies';
            const upload = uploader(path, 'IMG').fields([{ name: 'imagemovies' }]);
            upload(req, res, (err) => {
                if (err) return res.status(500).send(err)

                const { imagemovies } = req.files;
                const imagePath = imagemovies ? path + '/' + imagemovies[0].filename : null;

                const dataMovies = JSON.parse(req.body.dataMovies);
                dataMovies.imagemovies = imagePath;

                const changeImage = dataMovies.changeImage;
                const { title, duration, genre, synopsis, casts, producer, director, writter } = dataMovies;
                const queryEditMovies = `UPDATE movies SET title = '${title}', duration = ${duration}, genre = '${genre}', synopsis = '${synopsis}', casts = '${casts}', 
                producer = '${producer}', director = '${director}', writter = '${writter}' WHERE idmovies = ${req.query.idmovies}`;
                database.query(queryEditMovies, (err, resultsEditMovies) => {
                    if (err) return res.status(500).send(err)

                    const queryGetMovies = `SELECT * FROM movies WHERE idmovies = ${req.query.idmovies}`;
                    database.query(queryGetMovies, (err, resultsGetMovies) => {
                        if (err) {
                            return res.status(500).send(err)
                        } else if (resultsGetMovies !== 0) {
                            if (changeImage) {
                                const queryEditImage = `UPDATE movies SET imagemovies = '${dataMovies.imagemovies}' WHERE idmovies = ${req.query.idmovies}`;
                                database.query(queryEditImage, (err, resultsEditImage) => {
                                    if (err) return res.status(500).send(err)

                                    if (imagemovies) {
                                        if (resultsGetMovies[0].imagemovies === 0) {
                                            return null
                                        } else {
                                            fs.unlinkSync('./Public' + resultsGetMovies[0].imagemovies)
                                        }
                                    }
                                    res.status(200).send(resultsEditMovies)
                                })
                            } else {
                                res.status(200).send(resultsEditMovies)

                            }
                        }
                    })
                    // res.status(200).send(resultsEditMovies)
                })
            })
        } catch (err) {
            console.log(err)
        }
    },
    addLikeMovie: (req, res) => {
        const queryAddLikeMovie = `INSERT INTO likemovie SET ?`;
        database.query(queryAddLikeMovie, req.body, (err, resultsAddLikeMovie) => {
            if (err) return res.status(500).send(err)

            const queryGetMovies = `SELECT * FROM movies WHERE idmovies = ${req.body.movieId}`;
            database.query(queryGetMovies, (err, resultsGetMovies) => {
                if (err) return res.status(500).send(err)

                const queryEditMovies = `UPDATE movies SET likemovie = ${resultsGetMovies[0].likemovie + 1} WHERE idmovies = ${req.body.movieId}`;
                database.query(queryEditMovies, (err, resultsEditMovies) => {
                    if (err) return res.status(500).send(err)

                })
            })
            res.status(200).send(resultsAddLikeMovie)
        })
    },
    getLikeMovie: (req, res) => {
        const queryGetLikeMovie = `
        SELECT * FROM users u
        LEFT JOIN likemovie lm ON u.iduser = lm.userId
        LEFT JOIN movies m ON lm.movieId = m.idmovies
        WHERE u.iduser = ${req.user.iduser}
        `;
        database.query(queryGetLikeMovie, (err, resultsGetLikeMovies) => {
            if (err) return res.status(500).send(err)

            res.status(200).send(resultsGetLikeMovies)
        })
    },
    editLikeMovie: (req, res) => {
        let movieId = 0;
        let userId = 0;
        const queryDeleteLikeMovie = `UPDATE likemovie SET movieId = ${movieId}, userId = ${userId} WHERE idlikemovie = ${req.query.idlikemovie}`;
        database.query(queryDeleteLikeMovie, (err, resultsDeleteLikeMovies) => {
            if (err) return res.status(500).send(err)

            const queryGetMovie = `SELECT * FROM movies WHERE idmovies = ${req.body.idmovies}`;
            database.query(queryGetMovie, (err, resultsGetMovies) => {
                if (err) return res.status(500).send(err)

                const queryEditMovie = `UPDATE movies SET likemovie = ${resultsGetMovies[0].likemovie - 1} WHERE idmovies = ${req.body.idmovies}`;
                database.query(queryEditMovie, (err, resultsEditMovie) => {
                    if (err) return res.status(500).send(err)

                })
            })

            res.status(200).send(resultsDeleteLikeMovies)
        })
    },
    addCommentMovie: (req, res) => {
        const queryAddCommentMovie = `INSERT INTO commentmovie SET ?`;
        database.query(queryAddCommentMovie, req.body, (err, resultsAddCommentMovies) => {
            if (err) return res.status(500).send(err)

            const queryGetMovies = `SELECT * FROM movies WHERE idmovies = ${req.body.movieId}`;
            database.query(queryGetMovies, (err, resultsGetMovies) => {
                if(err) return res.status(500).send(err)

                const queryEditMovie = `UPDATE movies SET commentmovie = ${resultsGetMovies[0].commentmovie + 1} WHERE idmovies = ${req.body.movieId}`
                database.query(queryEditMovie, (err, resultsEditMovies) => {
                    if(err) return res.status(500).send(err)
                    
                })
            })

            res.status(200).send(resultsAddCommentMovies)
        })
    },
    getCommentMovie: (req, res) => {
        const queryGetCommentMovie = `
        SELECT * FROM users u
        LEFT JOIN commentmovie cm ON u.iduser = cm.userId
        LEFT JOIN movies m ON cm.movieId = m.idmovies
        WHERE m.idmovies = ${req.query.idmovies}
        `
        database.query(queryGetCommentMovie, (err, resultsGetCommentMovies) => {
            if(err) return res.status(500).send(err)

            res.status(200).send(resultsGetCommentMovies)
        })
    },
    deleteCommentMovie: (req, res) => {
        const queryDeleteCommentMovie = `DELETE FROM commentmovie WHERE idcommentmovie = ${req.query.idcommentmovie}`;
        database.query(queryDeleteCommentMovie, (err, resultsDeleteCommentsMovie) => {
            if(err) return res.status(500).send(err)

            const queryGetMovie = `SELECT * FROM movies WHERE idmovies = ${req.body.movieId}`;
            database.query(queryGetMovie, (err, resultsGetMovie) => {
                if(err) return res.status(500).send(err)
                
                const queryEditMovie = `UPDATE movies SET commentmovie = ${resultsGetMovie[0].commentmovie - 1} WHERE idmovies = ${req.body.movieId}`
                database.query(queryEditMovie, (err, resultsEditMovie) => {
                    if(err) return res.status(500).send(err)
                    
                })
            })

            res.status(200).send(resultsDeleteCommentsMovie)
        })
    }
}