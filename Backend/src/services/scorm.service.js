const ScormRegistration = require("../models/scorm/scormRegistration");
const ScormCmi = require("../models/scorm/scormCmi");

exports.createRegistration = async (userId, courseId) => {
  return await ScormRegistration.create({ userId, courseId });
};

exports.getCmiValue = async (registrationId, key) => {
  const record = await ScormCmi.findOne({ registrationId, key });
  return record ? record.value : "";
};

exports.setCmiValue = async (registrationId, key, value) => {
  return await ScormCmi.updateOne(
    { registrationId, key },
    { value },
    { upsert: true }
  );
};

exports.finishRegistration = async (registrationId) => {
  return await ScormRegistration.findByIdAndUpdate(
    registrationId,
    { completedAt: new Date() }
  );
};
