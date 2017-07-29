var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  user = require('./user'),
  Category = mongoose.model('Category');
  slug = require('slug');

module.exports = function (app) {
  app.use('/admin/categories', router);
};

router.get('/',user.requireLogin, function (req, res, next) {
         res.render('admin/category/index', {
        pretty: true
      });
});

router.get('/add',user.requireLogin, function (req, res, next) {
   res.render('admin/category/add', {
        action:"/admin/categories/add",
        category:{},
        pretty: true
    });
});
router.post('/add',user.requireLogin, function (req, res, next) {
      var name = req.body.name.trim();
        var category  = new Category({
            name,
            created:new Date(),
            slug:slug(name)
        });
        category.save(function(err, category){
            if(err) {
              console.log(2222)
                req.flash('error','分类保存失败！');
                res.redirect('/admin/categories/add');
                return;
            }
            req.flash('info','分类保存成功');
            res.redirect('/admin/categories');
        });

});

router.get('/edit/:id',user.requireLogin,getCategoryById, function (req, res, next) {
      var category = req.category;
      res.render('admin/category/add', {
          action:"/admin/categories/edit/"+category._id,
          category: category,
          pretty: true
        });
  
});
router.post('/edit/:id',user.requireLogin,getCategoryById, function (req, res, next) {
      var category = req.category;
    var name = req.body.name.trim();
        category.name = name;
        category.slug = slug(name);
        category.save(function(err, category){
            if(err) {
                req.flash('error','分类编辑失败！');
                res.redirect('/admin/categories/edit/'+category._id);
                return;
            }
            req.flash('info','分类保存成功');
            res.redirect('/admin/categories');
        });

});


router.get('/delete/:id',user.requireLogin, function (req, res, next) {
        if (!req.params.id) {
        return next(new Error('no category id provided'));
    }
    Category.remove({ _id: req.params.id }).exec(function (err, rowsRemoved) {
        if (err) {
            return next(err);
        }
        if (rowsRemoved) {
            req.flash('success', '分类删除成功！');
        } else {
            req.flash('success', '分类删除失败！');
        }
        res.redirect('/admin/categories')
    })
});

function getCategoryById(req,res,next) {
      if (!req.params.id) {
            return next(new Error('no post id provided'))
        }
    Category.findOne({_id:req.params.id})
    .exec(function(err,category){
        if (err) {
            return next(err);
        }
         if (!category) {
            return next(new Error('category not found:',req.params.id));
        }
        req.category = category;
        next();
    });
}

