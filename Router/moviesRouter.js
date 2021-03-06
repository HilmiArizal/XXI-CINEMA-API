const express = require('express');
const router = express.Router();
const { auth } = require('../Helper/auth');
const { moviesController } = require('../Controller');


router.get('/getMovies', moviesController.getMovies);
router.get('/getMoviesById', moviesController.getMoviesById);
router.get('/getBestMovies', moviesController.getBestMovies);
router.post('/addMovies', moviesController.addMovies);
router.patch('/editMovies', moviesController.editMovies);
router.delete('/deleteMovies', moviesController.deleteMovies);
router.get('/getMoviesUpComing', moviesController.getMoviesUpComing);
router.get('/getMoviesNowPlaying', moviesController.getMoviesNowPlaying);


router.post('/addLikeMovie', moviesController.addLikeMovie);
router.get('/getLikeMovie', auth, moviesController.getLikeMovie);
router.patch('/editLikeMovie', moviesController.editLikeMovie);

router.post('/addCommentMovie', moviesController.addCommentMovie);
router.get('/getCommentMovie', moviesController.getCommentMovie);
router.delete('/deleteCommentMovie', moviesController.deleteCommentMovie);
router.get('/get3CommentMovie', moviesController.get3CommentMovie);



module.exports = router;