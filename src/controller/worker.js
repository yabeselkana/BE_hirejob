const createError = require("http-errors");

const { selectAll, selectSearchWork, selectusers, select, countData, findId, insert, update, updatePhoto, deleteData } = require("../model/worker");
const commonHelper = require("../helper/common");
const cloudinary = require("../middlewares/cloudinary");

const Joi = require("joi");
// const user = require('../controller/users')
let workController = {
  getAllWork: async (req, res, next) => {
    try {
      // const role = req.payload.role;
      // //  console.log(role)
      //   if(role === "reseller"){
      //     return next(createError(403,`${role} not get data`))
      //   }
      const keyword = req.query.keyword || "";
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const sortby = req.query.sortby || "id";
      const sort = req.query.sort || "ASC";
      const result = await selectAll({ limit, offset, sort, sortby, keyword });
      const {
        rows: [count],
      } = await countData();
      const totalData = parseInt(count.count);
      const totalPage = Math.ceil(totalData / limit);
      const pagination = {
        currentPage: page,
        limit: limit,
        totalData: totalData,
        totalPage: totalPage,
      };
      // res.send(result)
      commonHelper.response(res, result.rows, 200, "get data success", pagination);
    } catch (error) {
      console.log(error);
    }
  },
  getSearchWork: async (req, res, next) => {
    try {
      // const role = req.payload.role
      // //  console.log(role)
      //   if(role === "reseller"){
      //     return next(createError(403,`${role} not get data`))
      //   }
      // const sortby = req.query.sortby || "id";
      const sort = req.query.sort || "ASC";
      const keyword = req.query.keyword || "";
      const result = await selectSearchWork({ keyword, sort });
      // res.send(result)
      commonHelper.response(res, result.rows, 200, "get data success");
    } catch (error) {
      console.log(error);
    }
  },

  getIdUsers: async (req, res, next) => {
    try {
      // const role = req.payload.role
      // //  console.log(role)
      //   if(role === "reseller"){
      //     return next(createError(403,`${role} not get data`))
      //   }
      // const sortby = req.query.sortby || "id";

      const iduser = req.query.iduser || "";
      const result = await selectusers({ iduser });
      // res.send(result)
      commonHelper.response(res, result.rows, 200, "get data success");
    } catch (error) {
      console.log(error);
    }
  },

  getDetailWork: async (req, res, next) => {
    // const role = req.payload.role;
    //  console.log(role)
    // if(role === "reseller"){
    //   return next(createError(403,`${role} not get data`))
    // }
    const id = Number(req.params.id);
    const { rowCount } = await findId(id);
    if (!rowCount) {
      return next(createError(403, "ID is Not Found"));
    }
    select(id)
      .then((result) => {
        // client.setEx(`product/${id}`, 60 * 60, JSON.stringify(result.rows));
        commonHelper.response(res, result.rows, 200, "get data success from database", {});
      })
      .catch((err) => res.send(err));
  },

  // validates: async (req, res, next) => {
  //   const Schema = Joi.object({
  //     name: Joi.string(),
  //   });
  //   const results = Schema.validate(req.body);
  //   const { value, error } = results;

  //   if (error) {
  //     return commonHelper.response(res, results.rows, 422, error.message);
  //   }
  // },

  createWork: async (req, res, next) => {
    // const role = req.payload.role;
    //  console.log(role)
    // if (role !== "reseller") {
    //   return next(createError(403, `${role} Not Entri Data`));
    // }

    const { name, jobdesk, domisili, status_kerja, tempat_kerja, deskripsi, id_users } = req.body;
    const Schema = Joi.object({
      name: Joi.string()
        .pattern(/^[a-zA-Z\s]+$/)
        .required(),
      jobdesk: Joi.string().required(),
      domisili: Joi.string().required(),
      status_kerja: Joi.string().required(),
      tempat_kerja: Joi.string().required(),
      id_users: Joi.string().required(),
      deskripsi: Joi.string().required(),
    });
    const results = Schema.validate(req.body, { abortEarly: false });
    const { value, error } = results;

    if (error) {
      return next(500, error);
    }

    // const result = await cloudinary.uploader.upload(req.file.path);
    // const photo = result.secure_url;

    const {
      rows: [count],
    } = await countData();
    const id = Number(count.count) + 1;
    const PORT = process.env.PORT || 4000;
    const DB_HOST = process.env.DB_HOST || "localhost";
    // console.log("berhasil");
    const data = {
      id,
      name,
      jobdesk,
      domisili,
      status_kerja,
      tempat_kerja,
      id_users,
      deskripsi,
    };
    console.log(data);
    insert(data)
      .then((result) => commonHelper.response(res, data, 201, "Worker created", {}))
      .catch((err) => res.send(err));
  },
  updateWork: async (req, res, next) => {
    try {
      // const role = req.payload.role;
      // //  console.log(role)
      // if (role !== "reseller") {
      //   return next(createError(403, `${role} Not Update Data`));
      // }
      const PORT = process.env.PORT || 4000;
      const DB_HOST = process.env.DB_HOST || "localhost";
      const id = Number(req.params.id);
      // const result = await cloudinary.uploader.upload(req.file.path);
      // const photo = result.secure_url;
      // const cloudinary_id = result.public_id;
      const { name, jobdesk, domisili, status_kerja, tempat_kerja, deskripsi, id_users } = req.body;
      const Schema = Joi.object({
        name: Joi.string()
          .pattern(/^[a-zA-Z\s]+$/)
          .required(),
        jobdesk: Joi.string().required(),
        domisili: Joi.string().required(),
        status_kerja: Joi.string().required(),
        tempat_kerja: Joi.string().required(),
        deskripsi: Joi.string().required(),
        id_users: Joi.string().required(),
      });
      const results = Schema.validate(req.body, { abortEarly: false });
      const { value, error } = results;

      if (error) {
        return next(error);
      }
      const { rowCount } = await findId(id);
      if (!rowCount) {
        return next(createError(403, "ID is Not Found"));
      }
      const data = {
        id,
        name,
        jobdesk,
        domisili,
        status_kerja,
        tempat_kerja,
        deskripsi,
        id_users,
      };
      // console.log(data)
      update(data)
        .then((result) => commonHelper.response(res, data, 200, "Worker updated", {}))
        .catch((err) => res.send(err));
    } catch (error) {
      console.log(error);
    }
  },
  updateRekrutPhoto: async (req, res, next) => {
    try {
      // const role = req.payload.role;
      // //  console.log(role)
      // if (role !== "reseller") {
      //   return next(createError(403, `${role} Not Update Data`));
      // }
      const PORT = process.env.PORT || 4000;
      const DB_HOST = process.env.DB_HOST || "localhost";
      const id = Number(req.params.id);
      const result = await cloudinary.uploader.upload(req.file.path);
      const photo = result.secure_url;
      const cloudinary_id = result.public_id;
      const { rowCount } = await findId(id);
      if (!rowCount) {
        return next(createError(403, "ID is Not Found"));
      }
      const data = {
        id,
        photo,
      };
      console.log(data);
      updatePhoto(data)
        .then((result) => commonHelper.response(res, data, 200, "Worker updated", {}))
        .catch((err) => res.send(err));
    } catch (error) {
      console.log(error);
    }
  },

  deleteWork: async (req, res, next) => {
    try {
      // const role = req.payload.role;
      // //  console.log(role)
      // if (role !== "reseller") {
      //   return next(createError(403, `${role} Not Entri Data`));
      // }
      const id = Number(req.params.id);
      const { rowCount } = await findId(id);
      if (!rowCount) {
        return next(createError(403, "ID is Not Found"));
      }
      deleteData(id)
        .then((result) => commonHelper.response(res, result.rows, 200, "Worker deleted", {}))
        .catch((err) => res.send(err));
    } catch (error) {
      console.log(error);
    }
  },
};

module.exports = workController;
