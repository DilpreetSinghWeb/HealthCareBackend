import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";
import User from "../models/UserSchema.js";

export const updateDoctor = async (req, res) => {
  const id = req.params.id;
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Successfully updated",
      data: updatedDoctor,
    });
  } catch (error) {
    res.status(500).json({ success: true, message: "Failed to update Doctor" });
  }
};

export const deleteDoctor = async (req, res) => {
  const id = req.params.id;
  try {
    await Doctor.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Successfully deleted",
    });
  } catch (error) {
    res.status(500).json({ success: true, message: "Failed to delete " });
  }
};

export const getSingleDoctor = async (req, res) => {
  const id = req.params.id;
  try {
    const doctor = await Doctor.findById(id).populate("reviews").select("-password");

    res.status(200).json({
      success: true,
      message: "Doctor Found",
      data: doctor,
    });
  } catch (error) {
    res.status(404).json({ success: true, message: "No Doctor Found" });
  }
};

export const getAllDoctor = async (req, res) => {
  try {
    const {query} = req.query;
    let doctors;

    if (query) {
      doctors = await Doctor.find({
        isApproved: "approved",
        $or: [
          { name: { $regex: query , $options: "i" } },  // No reassignment, using $regex
          { specialization: { $regex: query, $options: "i" } }, // No reassignment
        ],
      }).select("-password");
    } else {
      doctors = await Doctor.find({ isApproved: "approved" }).select("-password");
    }

    res.status(200).json({
      success: true,
      message: "Doctors Found",
      data: doctors,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });

  }
};



export const getDoctorProfile = async (req, res) => {
  const doctorId = req.userId;
  try {
    const doctor = await Doctor.findOne({_id:doctorId});
    if(!doctor){
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const {password, ...rest} = doctor._doc;
    const appointments = await Booking.find({doctor:doctorId});

    res.status(200).json({success:true,message:'Profile info is getting',data:{...rest,appointments}})

  } catch (error) {
    res.status(500).json({success:true,message:'Something went wrong, cannot get'})

  }
}