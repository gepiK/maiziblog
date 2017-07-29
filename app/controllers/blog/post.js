var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  Category = mongoose.model('Category');

module.exports = function (app) {
  app.use('/posts', router);
};

router.get('/', function (req, res, next) {
    var condictions = {published:true};
    if(req.query.keyword){
      condictions.title =new RegExp(req.query.keyword.trim(),'i');
      condictions.content =new RegExp(req.query.keyword.trim(),'i');
    }
  Post.find(condictions)
    .sort('created')
    .populate('author')
    .populate('category')
    .exec(function (err, posts) {
      if (err) return next(err);
      var pageNum = Math.abs(parseInt(req.query.page || 1, 10));
      var pageSize = 10;
      var totalCount = posts.length;
      var pageCount = Math.ceil(totalCount / pageSize);
      if (pageNum > pageCount) {
        pageNum = pageCount
      }
      res.render('blog/index', {
        posts: posts.slice((pageNum - 1) * pageSize, pageNum * pageSize),
        pageNum: pageNum,
        pageCount: pageCount,
        pageCount: pageCount,
        keyword: req.query.keyword,
        pretty: true
      });
    });
});

router.get('/view/:id', function (req, res, next) {
  if (!req.params.id) {
    return next(new Error('no post id provided'))
  }
  // 对SEO的兼容
  var conditions = {};
  try{
    conditions._id = mongoose.Types.ObjectId(req.params.id);
  }catch(err){
      conditions.slug = req.params.id;
  }
    Post.findOne(conditions)
    .populate('category')
    .populate('author')
    .exec(function(err,post){
      if(err) return next(err);
      res.render('blog/view', {
          post: post,
          pretty: true
        });
    })
});
router.get('/favourite/:id', function (req, res, next) {
  if (!req.params.id) {
    return next(new Error('no post id provided'))
  }
  // 对SEO的兼容
  var conditions = {};
  try{
    conditions._id = mongoose.Types.ObjectId(req.params.id);
  }catch(err){
      conditions.slug = req.params.id;
  }
    Post.findOne({_id:conditions})
    .populate('category')
    .populate('author')
    .exec(function(err,post){
      if(err) return next(err);
      post.meta.favorites = post.meta.favorites ? post.meta.favorites + 1 : 1;
      post.markModified('meta');
      post.save(function(err){
        res.redirect('/posts/view/'+post.slug);
      });
    })
});


router.post('/comment/:id', function (req, res, next) {
    if (!req.body.email) {
    return next(new Error('no email provided for commeter'))
  }
  if (!req.body.content) {
    return next(new Error('no content provided for commeter'))
  }
  // 对SEO的兼容
  var conditions = {};
  try{
    conditions._id = mongoose.Types.ObjectId(req.params.id);
  }catch(err){
      conditions.slug = req.params.id;
  }
    Post.findOne(conditions)
    .exec(function(err,post){
      if(err) return next(err);
      var comment = {
        email:req.body.email,
        content:req.body.content,
        created:new Date()
      };
      post.comments.unshift(comment);
      post.markModified('comments');
      post.save(function(err, post){
        req.flash('info','评论添加成功!');
          res.redirect('/posts/view/'+post.slug);
      })
      
    })
});


router.get('/category/:name', function (req, res, next) {
  //res.jsonp(req.params);
  Category.findOne({ name: req.params.name }).exec(function (err, category) {
    if (err) return next(err);
    //res.jsonp(category);
    Post.find({ category: category, published: true })
      .sort('created')
      .populate('category')
      .populate('author')
      .exec(function (err, posts) {
        //res.jsonp(posts);
        if (err) return next(err);
        res.render('blog/category', {
          posts: posts,
          category: category,
          pretty: true
        });
      })
  })
}); 
