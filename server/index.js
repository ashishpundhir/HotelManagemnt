const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userBooking = require("./models/userBooking");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
  } catch (error) {
    console.log(error);
  }
};

app.post("/bookRoom", async (req, res) => {
  try {
    const { startTime, endTime, date, roomType, roomNumber, username, price } =
      req.body;
    const room = await userBooking.find({
      startTime,
      date,
      roomType,
      roomNumber,
    });
    const room3 = await userBooking.find({
      endTime,
      date,
      roomType,
      roomNumber,
    });
    const room2 = await userBooking.findOne({
      startTime,
      endTime,
      date,
      roomType,
      roomNumber,
    });

    if (room.length > 0 || room3.length > 0) {
      return res.status(409).json({ message: "Room is already booked" });
    }

    if (room2) {
      room2.bookingActive = true;
      await room2.save();
      return res.status(200).json({ message: "Room booked successfully" });
    }

    const newRoom = new userBooking({
      username,
      startTime,
      endTime,
      date,
      roomType,
      roomNumber,
      price,
    });
    await newRoom.save();
    return res.status(200).json({ message: "Room booked successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    await userBooking.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/update/:id", async (req, res) => {
  try {
    const updatedBooking = req.body;

    const existingBooking = await userBooking.findOne({
      ...updatedBooking,
    });

    if (existingBooking) {
      return res.status(409).json({ message: "Booking already exists" });
    }
    const result2 = await userBooking.updateOne(
      { _id: req.params.id },
      { $set: updatedBooking }
    );

    res.status(200).json({ message: "Booking updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    await userBooking.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/search", async (req, res) => {
  const { roomType, roomNumber, startTime, endTime } = req.query;

  let query = {};

  if (roomType && roomNumber) {
    query = { roomType, roomNumber };
  } else if (startTime && endTime) {
    query = { startTime, endTime };
  }

  try {
    let result = await userBooking.find(query);
    res.send(result);
  } catch (err) {
    console.error(err);
  }
});

app.listen(8000, () => {
  connect();
  console.log("Listening");
});
