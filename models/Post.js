const postCollection = require('../db').db().collection("post")
const ObjectID = require('mongodb').ObjectID

let Post = function (data, userid) {
    this.data = data
    this.errors = []
    this.userid = userid
}

Post.prototype.cleanUp = function () {
    if (typeof(this.data.title) != "string") {this.data.title = ""}
    if (typeof(this.data.body) != "string") {this.data.body = ""}
    
    // Gets rid of bogus properties
    this.data = {
        title: this.data.title.trim(),
        body: this.data.body.trim(),
        createdDate: new Date(),
        author: ObjectID(this.userid)
    }
}

Post.prototype.validate = function () {
    if(this.data.title == "") {this.errors.push("You must provide a valid title")}
    if(this.data.body == "") {this.errors.push("You must post content")}
}

Post.prototype.create = function () {
    return new Promise((resolve, reject) => {
        this.cleanUp()
        this.validate()
        if (!this.errors.length) {
            // Save post into database
            postCollection.insertOne(this.data).then(() => {
                resolve()
            }).catch(() => {
                this.errors.push("Please try again later")
                reject(this.errors)
            })
        } else {
            reject(this.errors)
        }
    })
}

Post.findSingleByID = function (id) {
    return new Promise(async (resolve, reject) => {
        if (typeof (id) != "string" || !ObjectID.isValid(id)) {
            reject()
            return
        }
        let post = await postCollection.findOne({ _id: new ObjectID(id) })
        if (post) { 
            resolve(post)
        } else {
            reject()
        }
    })
}

module.exports = Post