"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gender = exports.Provider = void 0;
var Provider;
(function (Provider) {
    Provider[Provider["LOCAL"] = 0] = "LOCAL";
    Provider[Provider["GOOGLE"] = 1] = "GOOGLE";
    Provider[Provider["FACEBOOK"] = 2] = "FACEBOOK";
})(Provider || (exports.Provider = Provider = {}));
var Gender;
(function (Gender) {
    Gender[Gender["MALE"] = 0] = "MALE";
    Gender[Gender["FEMALE"] = 1] = "FEMALE";
})(Gender || (exports.Gender = Gender = {}));
