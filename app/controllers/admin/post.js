var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    User = mongoose.model('User'),
    user = require('./user'),
    Category = mongoose.model('Category'),
    slug = require('slug');

module.exports = function (app) {
    app.use('/admin/posts', router);
};

router.get('/',user.requireLogin, function (req, res, next) {
    var sortby = req.query.sortby ? req.query.sortby : 'created';
    var sortdir = req.query.sortdir ? req.query.sortdir : 'desc';
    if (['title', 'category', 'author', 'created', 'published'].indexOf(sortby) === -1) {
        sortby = 'created';
    }
    if (['desc', 'asc'].indexOf(sortdir) === -1) {
        sortdir = 'desc';
    }
    var sortObj = {};
    sortObj[sortby] = sortdir;

    var condictions = {};
    if(req.query.Category){
        condictions.Category = req.query.Category.trim();
    }
    if(req.query.author){
        condictions.author = req.query.author.trim();
    }
    if(req.query.keyword){
        condictions.title =new RegExp(req.query.keyword.trim(),'i');
        condictions.content =new RegExp(req.query.keyword.trim(),'i');
    }

    User.find({}, function (err, authors) {
        if (err) return next(err);

        Post.find(condictions)
            .sort(sortObj)
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
                res.render('admin/post/index', {
                    posts: posts.slice((pageNum - 1) * pageSize, pageNum * pageSize),
                    pageNum: pageNum,
                    pageCount: pageCount,
                    sortdir: sortdir,
                    sortby: sortby,
                    authors: authors,
                    pretty: true,
                    filter:{
                        category:req.query.category || '',
                        author:req.query.author || '',
                        keyword:req.query.keyword || ''
                    }
                });
            });
    });

});

router.get('/add',user.requireLogin, function (req, res, next) {
    res.render('admin/post/add', {
        action:"/admin/posts/add",
        post:{},
        pretty: true
    });
});
router.post('/add',user.requireLogin, function (req, res, next) {
    var title = req.body.title.trim();
    var category = req.body.category.trim();
    var content = req.body.content;
    User.findOne({},function(err, author){
        if(err) return next(err);
        // var py = pinyin(title, {
        //     style:pinyin.STYLE_NORMAL,
        //     heteronym:false
        // }).map(function(item){
        //     return item[0];
        // }).join(' ');

        var post  = new Post({
            title,
            category,
            content,
            author,
            meta:{favorite:0},
            comments:[],
            created:new Date(),
            slug:slug(title)
        });
        post.save(function(err, post){
            if(err) {
                req.flash('error','文章保存失败！');
                res.redirect('/admin/posts/add');
            }
            req.flash('info','文章保存成功');
            res.redirect('/admin/posts');
        });
    });
});
router.get('/edit/:id',user.requireLogin,getPostById, function (req, res, next) {
    var post = req.post;
      res.render('admin/post/add', {
          action:"/admin/posts/edit/"+post._id,
          post: post,
          pretty: true
        });
});
router.post('/edit/:id',user.requireLogin,getPostById, function (req, res, next) {
    var post = req.post;
    var title = req.body.title.trim();
    var category = req.body.category.trim();
    var content = req.body.content;
        post.title = title;
        post.category = category;
        post.content = content;
        post.slug = slug(title);
        post.save(function(err, post){
            if(err) {
                req.flash('error','文章编辑失败！');
                res.redirect('/admin/posts/edit/'+post._id);
            }
            req.flash('info','文章保存成功');
            res.redirect('/admin/posts');
        });
});


router.get('/delete/:id',user.requireLogin, function (req, res, next) {
    if (!req.params.id) {
        return next(new Error('no post id provided'));
    }
    Post.remove({ _id: req.params.id }).exec(function (err, rowsRemoved) {
        if (err) {
            return next(err);
        }
        if (rowsRemoved) {
            req.flash('success', '文章删除成功！');
        } else {
            req.flash('success', '文章删除失败！');
        }
        res.redirect('/admin/posts')
    })
});

function getPostById(req,res,next) {
      if (!req.params.id) {
            return next(new Error('no post id provided'))
        }
    Post.findOne({_id:req.params.id})
    .populate('category')
    .populate('author')
    .exec(function(err,post){
        if (err) {
            return next(err);
        }
         if (!post) {
            return next(new Error('post not found:',req.params.id));
        }
        req.post = post;
        next();
    });
}