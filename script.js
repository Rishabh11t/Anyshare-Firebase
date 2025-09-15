const firebaseConfig = {
  apiKey: "AIzaSyBPlnG8AQWAQS5O0TFFnIHyw2DfiNqAHfM",
  authDomain: "image-share-4446c.firebaseapp.com",
  projectId: "image-share-4446c",
  storageBucket: "image-share-4446c.appspot.com",
  messagingSenderId: "424462799129",
  appId: "1:424462799129:web:33b634c2a607aa72cb3588",
  measurementId: "G-31PPT6CB61",
  databaseURL: "https://image-share-4446c-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);
var messagesRef = firebase.database().ref("ImageLinks");

// ✅ File size check
function flesize() {
  const file = document.getElementById("file").files[0];
  if (file && file.size > 100 * 1024 * 1024) { // 100 MB
    alert("⚠️ Max file size allowed is 100MB.");
    document.getElementById("file").value = "";
  }
}

// ✅ Upload
function uploadImage() {
  const file = document.getElementById("file").files[0];
  if (!file) {
    alert("Please select a file first.");
    return;
  }

  const uniqueId = Math.floor(10000 + Math.random() * 90000).toString();
  const storageRef = firebase.storage().ref("images/" + uniqueId + "_" + file.name);

  const btnText = document.getElementById("upload").querySelector("span");
  btnText.textContent = "Uploading...";

  storageRef.put(file).then(() => {
    storageRef.getDownloadURL().then(url => {
      // Save entry in DB
      messagesRef.child(uniqueId).set({
        url: url,
        name: file.name
      });

      // Show Unique Code
      document.getElementById("ShowUniqueID").style.display = "block";
      document.getElementById("showunique").value = uniqueId;

      btnText.textContent = "Upload";
      document.getElementById("file").value = "";
      alert("✅ File uploaded successfully!\nYour code is: " + uniqueId);
    });
  }).catch(err => {
    console.error("Upload failed:", err);
    btnText.textContent = "Upload";
    alert("❌ Error uploading file. Try again.");
  });
}

// ✅ Download (One-time only)
function showimage() {
  const uniqueId = document.getElementById("unique").value.trim();
  if (!uniqueId) {
    alert("Please enter your file code.");
    return;
  }

  const btnText = document.getElementById("show").querySelector("span");
  btnText.textContent = "Fetching...";

  messagesRef.child(uniqueId).once("value").then(snapshot => {
    if (!snapshot.exists()) {
      btnText.textContent = "Download";
      alert("❌ Invalid or expired code.");
      return;
    }

    const data = snapshot.val();
    const link = document.createElement("a");
    link.href = data.url;
    link.download = data.name;
    link.click();

   

    btnText.textContent = "Download";
    document.getElementById("unique").value = "";
    alert("✅ File downloaded.");
  }).catch(err => {
    console.error("Download error:", err);
    btnText.textContent = "Download";
    alert("❌ Something went wrong while fetching file.");
  });
}

// ✅ Press Enter to trigger download
document.getElementById("unique").addEventListener("keyup", e => {
  if (e.key === "Enter") {
    document.getElementById("show").click();
  }
});
