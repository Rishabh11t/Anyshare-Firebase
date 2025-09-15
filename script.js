const firebaseConfig = {
  apiKey: "AIzaSyBPlnG8AQWAQS5O0TFFnIHyw2DfiNqAHfM",
  authDomain: "image-share-4446c.firebaseapp.com",
  projectId: "image-share-4446c",
  storageBucket: "image-share-4446c.appspot.com",
  messagingSenderId: "424462799129",
  appId: "1:424462799129:web:33b634c2a607aa72cb3588",
  measurementId: "G-31PPT6CB61",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference messages collection
var messagesRef = firebase.database().ref("image");

// --- Loader Helpers ---
function showLoader(id) {
  const img = document.getElementById(id);
  if (img) {
    img.style.display = "inline-block";
    img.style.width = "18px";
    img.style.height = "18px";
  }
}
function hideLoader(id) {
  const img = document.getElementById(id);
  if (img) {
    img.style.display = "none";
  }
}

// --- Upload Image ---
function uploadImage() {
  const fileInput = document.getElementById("file");
  if (fileInput.value !== "") {
    const file = fileInput.files[0];
    const storageRef = firebase.storage().ref("images/" + file.name);

    // Show loader
    showLoader("uping");
    const uploadBtn = document.getElementById("upload").querySelector("span");
    uploadBtn.textContent = "Uploading...";

    const uploadTask = storageRef.put(file);

    uploadTask.on(
      "state_changed",
      function (snapshot) {
        const progress = (
          (snapshot.bytesTransferred / snapshot.totalBytes) *
          100
        ).toFixed(2);
        console.log("Upload is " + progress + "% done");
        uploadBtn.textContent = "Uploading " + progress + "%...";
      },
      function (error) {
        console.log(error.message);
        uploadBtn.textContent = "Upload Failed";
        hideLoader("uping");
      },
      function () {
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          console.log("File available at", downloadURL);
          saveMessage(downloadURL);
          uploadBtn.textContent = "Upload Successful";
          hideLoader("uping");
        });
      }
    );
  } else {
    const uploadBtn = document.getElementById("upload").querySelector("span");
    const oldText = uploadBtn.textContent;
    uploadBtn.textContent = "Please select a file";
    setTimeout(() => {
      uploadBtn.textContent = oldText;
    }, 2000);
  }
}

// --- Save Message ---
function saveMessage(downloadURL) {
  const newMessageRef = messagesRef.push();
  const unique = createUniquenumber();

  // Hide download section
  document.getElementById("downloadiv").style.display = "none";

  // Show unique ID
  const showUnique = document.getElementById("ShowUniqueID");
  const shU = document.getElementById("showunique");
  shU.value = unique;
  showUnique.style.display = "block";

  newMessageRef.set({
    url: downloadURL,
    number: unique,
  });

  // Reset file input
  document.getElementById("file").value = "";
}

// --- Generate Unique Number ---
function createUniquenumber() {
  const number = Math.floor(10000 + Math.random() * 90000);
  const ref = firebase.database().ref("image");

  ref.once("value", function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      const childData = childSnapshot.val();
      if (childData.number == number) {
        createUniquenumber();
      }
    });
  });

  return number;
}

// --- Show Image ---
function showimage() {
  const uniqueId = document.getElementById("unique").value;
  if (uniqueId === "") {
    alert("Unique Id is empty\nPlease enter a Unique Id");
    return;
  }

  // Show loader
  showLoader("downimg");
  const showBtn = document.getElementById("show").querySelector("span");
  showBtn.textContent = "Fetching...";

  const ref = firebase.database().ref("image");
  let flag = 0;

  ref.once("value", function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      const childData = childSnapshot.val();
      if (childData.number == uniqueId) {
        flag = 1;
        window.open(childData.url, "_blank");

        // Delete from DB
        ref.child(childSnapshot.key).remove();

        // Delete from Storage after delay
        setTimeout(function () {
          const storageRef = firebase.storage().refFromURL(childData.url);
          storageRef
            .delete()
            .then(() => console.log("File deleted successfully"))
            .catch((error) => console.log(error));
        }, 15000);
      }
    });

    // Reset UI
    hideLoader("downimg");
    showBtn.textContent = flag ? "Downloaded" : "Not Found";
    if (!flag) {
      setTimeout(() => {
        showBtn.textContent = "Download";
      }, 2000);
    }
  });
}

// --- File Size Check ---
function flesize() {
  const file = document.getElementById("file").files[0];
  if (file && file.size > 100000000) {
    alert("File size is greater than 100MB\nPlease select a file less than 100MB");
    document.getElementById("file").value = "";
  }
}

// --- Press Enter to Download ---
document.getElementById("unique").addEventListener("keyup", function (event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    document.getElementById("show").click();
  }
});
