const User = require('../models/User')
const Post = require('../models/Post')

exports.mustBeLoggedIn = function (req, res, next) {
    if (req.session.user) {
        next()
    } else {
        req.flash("errors", "You must be logged in to perform that action")
        req.session.save(() => {
            res.redirect('/')
        })
    }
}

exports.login = (req, res) => {
    let user = new User(req.body)
    user.login().then((result) => {
        req.session.user = {avatar: user.avatar, username: user.data.username, _id: user.data._id}
        req.session.save(() => {
            res.redirect('/')
        })
    }).catch((e) => {
        req.flash('errors', e)
        req.session.save(() => {
            res.redirect('/')
        })
    })
}

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
}

exports.register = (req, res) => {
    let user = new User(req.body)
    user.register().then(() => {
        req.session.user = { username: user.data.username, avatar: user.avatar, _id: user.data._id }
        req.session.save(() => {
            res.redirect('/')
        })
    }).catch((regErrors) => {
        regErrors.forEach((error) => {
            req.flash('regErrors', error)
        })
        req.session.save(() => {
            res.redirect('/')
        })
    })
}

exports.home = (req, res) => {
    if (req.session.user) {
        res.render('home-dashboard')
    } else {
        res.render('home-guest', {regErrors: req.flash('regErrors')})
    }
} 

exports.ifUserExist = (req, res, next) => {
    User.findByUsername(req.params.username).then((userDocument) => {
        req.profileUser = userDocument
        next()
    }).catch(() => {
        res.render('404')
    })
}

exports.profilePostsScreen = (req, res) => {
    //  ask our post model for posts by a certain author id
    Post.findByAuthorID(req.profileUser._id).then((posts) => {
        res.render('profile', {
            posts: posts,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar
        })
    }).catch(() => {
        res.render('404')
    })

}