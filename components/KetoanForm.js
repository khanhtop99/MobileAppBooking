import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  Modal,
  StatusBar,
  Alert,
} from "react-native";
import styles from "./css/KetoanStyle";
import {
  GestureHandlerRootView,
  ScrollView as GestureHandlerScrollView,
} from "react-native-gesture-handler";

import { useNavigation } from "@react-navigation/native";

import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";

import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, child, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCicrLXIoWCQd3XvIFoNaUrYpuCRydsgaQ",
  authDomain: "bookingshit-3c16d.firebaseapp.com",
  databaseURL: "https://bookingshit-3c16d-default-rtdb.firebaseio.com",
  projectId: "bookingshit-3c16d",
  storageBucket: "bookingshit-3c16d.appspot.com",
  messagingSenderId: "948204112931",
  appId: "1:948204112931:web:c44088284d7536bd9af596",
  measurementId: "G-WKYFMTPZJ6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export default function UserForm({ route }) {
  const { inputText } = route.params;
  const user_name = inputText;
  const ReadOnlyField = ({ label, value }) => (
    <View style={{ padding: 10, fontSize: 20 }}>
      <Text style={{ fontWeight: "bold", textAlign: "left" }}>{label} </Text>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>{value}</Text>
    </View>
  );

  const [listBooking, setListBooking] = useState([]);
  const [listPayment, setListPayment] = useState([]);
  const [isModalUpVisible, setIsModalUpVisible] = useState(false);
  const [isModalDownVisible, setIsModalDownVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(false);
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [orderAmount, setOrderAmount] = useState(null);

  const [ctvName, setCTVName] = useState("");
  const [ctvPhone, setCTVPhone] = useState("");

  const [ctvRemain, setCTVRemain] = useState("");

  const [ctvAmount, setCTVAmount] = useState(0);

  const [image, setImage] = useState("");
  const [webUri, setWebUri] = useState("");

  function create(path, name, value) {
    set(ref(database, path + name), value);
  }

  function read(path, value) {
    const dbRef = ref(getDatabase());
    return get(child(dbRef, path))
      .then((snapshot) => {
        if (snapshot.exists()) {
          value.val = snapshot.val();
          return value.val; // Returning the value for further handling
        } else {
          console.log("No data available");
          return null; // Returning null if no data is available
        }
      })
      .catch((error) => {
        console.error(error);
        return null; // Returning null in case of an error
      });
  }
  useEffect(() => {
    handleRead();
  }, [ctvName, ctvPhone]);

  const handleRead = async () => {
    try {
      const snapshotBooking = await get(ref(database, "Booking"));
      const snapshotPayment = await get(ref(database, "Payment"));
      if (snapshotBooking.exists() && snapshotPayment.exists()) {
        setListBooking(snapshotBooking.val());
        setListPayment(snapshotPayment.val());
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addImageWeb = async () => {
    var values = { val: null };
    await read("Folder/Value", values);
    console.log(values.val); // Will contain the value after reading from the database
    // Do something with the input values
    var value = values.val;
    if (value > 1000) {
      value = 0;
    }
    value += 1;
    if (image && webUri) {
      console.log(image + webUri);
      create("/Folder/" + value.toString() + "/", "Image", image);
      create("/Folder/" + value.toString() + "/", "Uri", webUri);
      create("/Folder/", "Value", value);
    }
  };

  const getCTVPhoneBooking = async (bookingID) => {
    let valueUsername = { val: null };
    let valuePhone = { val: null };
    await read("/Booking/" + bookingID + "/Account", valueUsername);
    setCTVName(valueUsername.val);
    await read(
      "/User_management/" + valueUsername.val + "/Account/Phone/",
      valuePhone
    );
    setCTVPhone(valuePhone.val);
  };

  const getCTVPhonePayment = async (paymentID) => {
    let valueUsername = { val: null };
    let valuePhone = { val: null };
    let valueRemain = { val: null };
    let valueAmount = { val: null };
    await read("/Payment/" + paymentID + "/Username", valueUsername);
    setCTVName(valueUsername.val);
    await read("/Payment/" + paymentID + "/Amount", valueAmount);
    setCTVAmount(valueAmount.val);
    await read(
      "/User_management/" + valueUsername.val + "/Account/Phone/",
      valuePhone
    );
    setCTVPhone(valuePhone.val);
    await read(
      "/User_management/" + valueUsername.val + "/Agency/Amount_Remain",
      valueRemain
    );
    setCTVRemain(valueRemain.val);
  };

  const handleMoreUpPress = (bookingId) => {
    setSelectedBookingId(bookingId);
    getCTVPhoneBooking(bookingId);
    setIsModalUpVisible(true);
  };

  const handleMoreDownPress = (paymentID) => {
    setSelectedPaymentId(paymentID);
    setIsModalDownVisible(true);
    getCTVPhonePayment(paymentID);
  };

  const handleClose = () => {
    setOrderAmount("");
    setIsModalUpVisible(false);
  };

  const handleAccept = async () => {
    var valueUser = { val: null };
    var valueAmountTotal = { val: null };
    var valueAmountRemain = { val: null };
    await read(
      "/Booking/" + selectedBookingId.toString() + "/IDUser",
      valueUser
    );

    await read(
      "/User_management/" + ctvName + "/Agency/Amount_Total",
      valueAmountTotal
    );

    await read(
      "/User_management/" + ctvName + "/Agency/Amount_Remain",
      valueAmountRemain
    );

    if (orderAmount !== null) {
      Alert.alert("Bạn có chắc chắn muốn chấp nhận đơn không?", "", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            create(
              "/Booking/" + selectedBookingId.toString() + "/",
              "Amount",
              orderAmount
            );

            create(
              "/Booking/" + selectedBookingId.toString() + "/",
              "Status",
              "Purchase"
            );

            //add in user_management
            //Booking
            create(
              "/User_management/" +
                ctvName +
                "/Account/Booking/" +
                valueUser.val +
                "/",
              "Amount",
              orderAmount
            );

            create(
              "/User_management/" +
                ctvName +
                "/Account/Booking/" +
                valueUser.val +
                "/",
              "Status",
              "Purchase"
            );

            //Agency
            create(
              "/User_management/" + ctvName + "/Agency/",
              "Amount_Total",
              orderAmount / 10000 + valueAmountTotal.val
            );

            create(
              "/User_management/" + ctvName + "/Agency/",
              "Amount_Remain",
              orderAmount / 10000 + valueAmountRemain.val
            );
            Alert.alert("Xác nhận đơn thành công");
            setCTVName("");
            setCTVPhone("");
            setOrderAmount("");
          },
        },
      ]);
    } else {
      Alert.alert("Hãy nhập số tiền");
    }
  };

  const handleAcceptPayment = async () => {
    var valuePaymentRemain = { val: null };

    await read(
      "/User_management/" + ctvName + "/Agency/Amount_Remain",
      valuePaymentRemain
    );

    Alert.alert("Bạn có chắc chắn muốn chấp nhận đơn không?", "", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => {
          create(
            "/User_management/" + ctvName + "/Agency/",
            "Amount_Remain",
            valuePaymentRemain.val - ctvAmount
          );
          create("/Payment/" + selectedPaymentId + "/", "Status", "Done");
        },
      },
    ]);
  };

  const parseTimeString = (timeString) => {
    let parts = timeString.split(/[-/]/);
    let hour = parseInt(parts[0]);
    let day = parseInt(parts[1]);
    let month = parseInt(parts[2]);
    let year = parseInt(parts[3]);
    return new Date(year, month - 1, day, hour);
  };

  return (
    <>
      <StatusBar backgroundColor="black" />
      <GestureHandlerRootView
        style={[styles.white, styles.width_100, styles.height_100]}
      >
        <GestureHandlerScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* header */}
          <View style={[styles.flex, styles.black]}>
            <Text style={[styles.br_20]}></Text>
            <ImageBackground
              source={require("../assets/logo.jpg")}
              style={styles.logo}
            ></ImageBackground>
            <Text style={[styles.br_20]}></Text>
            <Text style={[{ color: "white", fontSize: 16 }]}>slogan</Text>

            <ImageBackground
              source={require("../assets/images/tra.png")}
              style={{ width: "100%", height: 115 }}
            ></ImageBackground>
          </View>

          {/* user */}
          <Text style={[styles.br_30]}></Text>

          <View style={styles.flex_row}>
            <ImageBackground
              source={require("../assets/images/DSC00200.jpg")}
              style={{ width: 85, height: 85, marginLeft: 20, marginRight: 20 }}
            ></ImageBackground>
            <View style={styles.flex_column}>
              <Text style={[styles.br_20]}></Text>
              <Text style={{ fontSize: 20 }}>{user_name}</Text>
              <View style={styles.flex_row}>
                <Text>Level 1</Text>
              </View>
            </View>
          </View>
          <Text style={[styles.br_20]}></Text>
          <Text style={[styles.br_20]}></Text>

          {/* Đơn hàng tích lũy */}
          <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 20 }}>
            Đơn hàng
          </Text>
          <Text style={[styles.br_20]}></Text>
          <View style={styles.orderContainer}>
            <GestureHandlerScrollView
              style={styles.scrollViews}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollViewContent}
            >
              {Object.keys(listBooking)
                .filter((bookingKey) => bookingKey !== "Value")
                .sort((a, b) => {
                  // Hàm so sánh cho việc sắp xếp theo trạng thái ưu tiên và sau đó theo thời gian từ mới nhất đến cũ nhất
                  const statusA = listBooking[a].Status;
                  const statusB = listBooking[b].Status;

                  // Chỉ số ưu tiên của trạng thái
                  const statusPriority = {
                    Coming: 0,
                    Arrival: 1,
                    Purchase: 2,
                    Cancel: 3,
                  };

                  // So sánh trạng thái theo ưu tiên
                  if (statusPriority[statusA] !== statusPriority[statusB]) {
                    return statusPriority[statusA] - statusPriority[statusB];
                  } else {
                    // Nếu trạng thái giống nhau, so sánh theo thời gian
                    const timeA = parseTimeString(listBooking[a].Time);
                    const timeB = parseTimeString(listBooking[b].Time);
                    return timeB - timeA;
                  }
                })
                .map((bookingKey) => {
                  let backgroundColor = "white"; // Màu mặc định là trắng
                  // Kiểm tra trạng thái và thiết lập màu tương ứng
                  switch (listBooking[bookingKey].Status) {
                    case "Coming":
                      backgroundColor = "#f9f9f9";
                      break;
                    case "Arrival":
                      backgroundColor = "#FFD700"; // Màu vàng
                      break;
                    case "Purchase":
                      backgroundColor = "#7AE582"; // Màu xanh lá cây
                      break;
                    case "Cancel":
                      backgroundColor = "#c65d5a"; // Màu đỏ
                      break;
                    default:
                      backgroundColor = "#f9f9f9";
                  }
                  return (
                    <View
                      style={[
                        styles.item,
                        { backgroundColor: backgroundColor },
                      ]}
                      key={bookingKey}
                    >
                      <View style={{ flexDirection: "column" }}>
                        <Text style={styles.title}>
                          {listBooking[bookingKey].Hub}
                        </Text>
                        <Text style={styles.title}>
                          {listBooking[bookingKey].Account}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleMoreUpPress(bookingKey)}
                        style={styles.moreButton}
                      >
                        <Text style={styles.moreButtonText}>More</Text>
                        {/* Icon cho nút More có thể thêm vào đây */}
                      </TouchableOpacity>
                    </View>
                  );
                })}
            </GestureHandlerScrollView>
          </View>

          <Text style={[styles.br_40]}></Text>
          {/* Yêu Cầu Thanh Toán */}
          <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 20 }}>
            Yên Cầu Thanh Toán
          </Text>
          <Text style={[styles.br_20]}></Text>
          <View style={styles.orderContainer}>
            <GestureHandlerScrollView
              style={styles.scrollViews}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollViewContent}
            >
              {Object.keys(listPayment)
                .filter((paymentKey) => paymentKey !== "Value")
                .map((paymentKey) => (
                  <View
                    style={[
                      styles.item,
                      {
                        backgroundColor:
                          listPayment[paymentKey].Status === "Pending"
                            ? "white"
                            : "green",
                      },
                    ]}
                    key={paymentKey}
                  >
                    <View style={{ flexDirection: "column" }}>
                      <Text style={styles.title}>
                        {listPayment[paymentKey].Name}
                      </Text>
                      <Text style={styles.title}>
                        {listPayment[paymentKey].Username}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.moreButton}
                      onPress={() => handleMoreDownPress(paymentKey)}
                    >
                      <Text style={styles.moreButtonText}>More</Text>
                      {/* Icon cho nút More có thể thêm vào đây */}
                    </TouchableOpacity>
                  </View>
                ))}
            </GestureHandlerScrollView>
          </View>

          <Text>Image URL</Text>
          <TextInput
            value={image}
            onChangeText={setImage}
            style={styles.input}
          ></TextInput>
          <Text style={{ height: 20 }}></Text>
          <Text>Web URL</Text>
          <TextInput
            value={webUri}
            onChangeText={setWebUri}
            style={styles.input}
          ></TextInput>
          <Text style={{ height: 20 }}></Text>
          <TouchableOpacity style={styles.button} onPress={addImageWeb}>
            <Text style={{ fontWeight: "bold" }}>Create</Text>
          </TouchableOpacity>
          <Text style={{ height: 20 }}></Text>

          <Modal
            visible={isModalUpVisible}
            animationType="slide"
            presentationStyle="pageSheet"
          >
            <GestureHandlerScrollView>
              <View style={styles.modalContainer}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                >
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 16 }}>Review and Confirm</Text>

                {/* Add your modal content here */}
                <ImageBackground
                  source={require("../assets/logo.jpg")}
                  style={styles.avatar}
                />
                <Text style={styles.userNameModal}>
                  {selectedBookingId && listBooking[selectedBookingId].Account}
                </Text>
                <Text style={styles.userEmailModal}>{ctvPhone}</Text>
                <View>
                  {/* sửa biến ở đây */}
                  <View style={[styles.containerDropDown]}>
                    <ReadOnlyField
                      label="Đơn tại:"
                      value={
                        selectedBookingId && listBooking[selectedBookingId].Hub
                      }
                    />
                  </View>

                  <View style={[styles.containerDropDown]}>
                    <ReadOnlyField
                      label="Tên khách hàng:"
                      value={
                        selectedBookingId && listBooking[selectedBookingId].Name
                      }
                    />
                  </View>

                  <View style={[styles.containerDropDown]}>
                    <ReadOnlyField
                      label="SĐT liên hệ:"
                      value={
                        selectedBookingId &&
                        listBooking[selectedBookingId].Phone
                      }
                    />
                  </View>

                  <View style={[styles.containerDropDown]}>
                    <ReadOnlyField
                      label="Số lượng khách:"
                      value={
                        selectedBookingId &&
                        listBooking[selectedBookingId].Quantity
                      }
                    />
                  </View>

                  <View style={[styles.containerDropDown]}>
                    <ReadOnlyField
                      label="Thời gian (10h-04/04/2024):"
                      value={
                        selectedBookingId && listBooking[selectedBookingId].Time
                      }
                    />
                  </View>

                  <View style={[styles.containerDropDown]}>
                    <ReadOnlyField
                      label="Ghi chú:"
                      value={
                        selectedBookingId && listBooking[selectedBookingId].Note
                      }
                    />
                  </View>
                </View>

                <View style={{ marginVertical: "5%" }}>
                  <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                    Tổng số tiền
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#E7E7E7",
                    width: "60%",
                    height: 100,
                    paddingVertical: 35,
                  }}
                >
                  <TextInput
                    textAlign="center"
                    style={{ fontSize: 30 }}
                    onChangeText={(text) => setOrderAmount(text)} // Update orderAmount when text changes
                    value={orderAmount} // Set the value of TextInput to orderAmount
                  ></TextInput>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={handleAccept} // Call handlePress when button is pressed
                    style={[styles.buttonModal, { backgroundColor: "#009470" }]}
                  >
                    <Text style={styles.modalButtonText}>Chấp nhận</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.buttonModal, { backgroundColor: "red" }]}
                  >
                    <Text style={styles.modalButtonText}>Hủy</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={{ height: 330 }}></Text>
            </GestureHandlerScrollView>
          </Modal>

          <Modal
            visible={isModalDownVisible}
            animationType="slide"
            presentationStyle="pageSheet"
          >
            <GestureHandlerScrollView>
              <View style={styles.modalContainer}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsModalDownVisible(false)}
                >
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 16 }}>Thông tin thanh toán</Text>

                {/* Add your modal content here */}
                <ImageBackground
                  source={require("../assets/logo.jpg")}
                  style={styles.avatar}
                />
                <Text style={styles.userNameModal}>
                  {selectedPaymentId && listPayment[selectedPaymentId].Username}
                </Text>
                <Text style={styles.userEmailModal}>{ctvPhone}</Text>
                <View>
                  <View style={[styles.containerDropDown]}>
                    <ReadOnlyField
                      label="Tên tài khoản"
                      value={
                        selectedPaymentId && listPayment[selectedPaymentId].Name
                      }
                    />
                  </View>

                  <View style={[styles.containerDropDown]}>
                    <ReadOnlyField
                      label="Ngân Hàng"
                      value={
                        selectedPaymentId && listPayment[selectedPaymentId].Bank
                      }
                    />
                  </View>

                  <View style={[styles.containerDropDown]}>
                    <ReadOnlyField
                      label="STK"
                      value={
                        selectedPaymentId &&
                        listPayment[selectedPaymentId].Number
                      }
                    />
                  </View>

                  <View style={[styles.containerDropDown]}>
                    <ReadOnlyField
                      label="Số điểm muốn rút"
                      value={
                        selectedPaymentId &&
                        listPayment[selectedPaymentId].Amount
                      }
                    />
                  </View>

                  <View style={[styles.containerDropDown]}>
                    <ReadOnlyField label="Số điểm hiện tại" value={ctvRemain} />
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={handleAcceptPayment}
                    style={[styles.buttonModal, { backgroundColor: "#009470" }]}
                  >
                    <Text style={styles.modalButtonText}>Chấp nhận</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.buttonModal, { backgroundColor: "red" }]}
                  >
                    <Text style={styles.modalButtonText}>Hủy</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={{ height: 330 }}></Text>
            </GestureHandlerScrollView>
          </Modal>
        </GestureHandlerScrollView>
      </GestureHandlerRootView>
    </>
  );
}
