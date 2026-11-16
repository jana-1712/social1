"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractRepository = void 0;
class AbstractRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    getModel() {
        return this.model;
    }
    async create(data) {
        return this.model.create(data);
    }
    async findById(id, projection) {
        return this.model.findById(id, projection);
    }
    async findOne(filter, projection) {
        return this.model.findOne(filter, projection);
    }
    async find(filter = {}, projection, options) {
        return this.model.find(filter, projection, options);
    }
    async update(filter, newData, options = { new: true }) {
        return this.model.findOneAndUpdate(filter, newData, options);
    }
    async updateById(id, newData, options = { new: true }) {
        return this.model.findByIdAndUpdate(id, newData, options);
    }
    async delete(id) {
        return this.model.deleteOne({ _id: id });
    }
    async deleteOne(filter) {
        return this.model.deleteOne(filter);
    }
    async deleteMany(filter) {
        return this.model.deleteMany(filter);
    }
    async countDocuments(filter = {}) {
        return this.model.countDocuments(filter);
    }
    async exists(filter) {
        return this.model.exists(filter);
    }
}
exports.AbstractRepository = AbstractRepository;
