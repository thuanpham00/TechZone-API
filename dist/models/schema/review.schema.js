"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Review {
    _id;
    productId;
    userId;
    rating;
    reviewText;
    created_at;
    updated_at;
    constructor(review) {
        const date = new Date();
        this._id = review._id;
        this.productId = review.productId;
        this.userId = review.userId;
        this.rating = review.rating;
        this.reviewText = review.reviewText;
        this.created_at = review.created_at || date;
        this.updated_at = review.updated_at || date;
    }
}
exports.default = Review;
