import api from "./api";

 const fetchPermissions = async () => {
    const response = await api.get("/api/globalAdmin/getPermissions");
    // console.log(response.data.data)
    return response.data.data;
 }


 module.exports = {
    fetchPermissions
 }
