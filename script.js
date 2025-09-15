// Firebase config (unchanged)
const firebaseConfig = {
  apiKey: "AIzaSyBPlnG8AQWAQS5O0TFFnIHyw2DfiNqAHfM",
  authDomain: "image-share-4446c.firebaseapp.com",
  projectId: "image-share-4446c",
  storageBucket: "image-share-4446c.appspot.com",
  messagingSenderId: "424462799129",
  appId: "1:424462799129:web:33b634c2a607aa72cb3588",
  measurementId: "G-31PPT6CB61",
};
firebase.initializeApp(firebaseConfig);

const db = firebase.database();
const messagesRef = db.ref("image");
const storage = firebase.storage();

// Upload with progress updates
function uploadImage() {
  const input = document.getElementById("file");
  if (!input.value) {
    const old = document.getElementById("upload").innerHTML;
    document.getElementById("upload").innerHTML = "Please select a file";
    setTimeout(() => (document.getElementById("upload").innerHTML = old), 2000);
    return;
  }

  const btn = document.getElementById("upload");
  btn.innerHTML = "Uploading...";

  const file = input.files;
  const storageRef = storage.ref("images/" + file.name);
  const uploadTask = storageRef.put(file);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(2);
      btn.innerHTML = `Uploading ${progress}%...`;
    },
    (error) => {
      console.log(error.message);
      btn.innerHTML = "Upload Failed";
    },
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        saveMessage(downloadURL);
      });
    }
  );
}

// Create a unique 5‑digit number by querying once
function generateUniqueNumber() {
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const number = Math.floor(10000 + Math.random() * 90000);
      messagesRef.orderByChild("number").equalTo(number).once(
        "value",
        (snap) => {
          if (snap.exists()) tryOnce();
          else resolve(number);
        },
        reject
      );
    };
    tryOnce();
  });
}

async function saveMessage(downloadURL) {
  const downloadDiv = document.getElementById("downloadiv");
  if (downloadDiv) downloadDiv.style.display = "none";

  try {
    const unique = await generateUniqueNumber();
    const newRef = messagesRef.push();
    await newRef.set({ url: downloadURL, number: unique });

    const showUnique = document.getElementById("ShowUniqueID");
    const shU = document.getElementById("showunique");
    if (shU) shU.value = unique;
    if (showUnique) showUnique.style.display = "block";

    document.getElementById("upload").innerHTML = "Upload Successful";
    document.getElementById("file").value = "";
  } catch (e) {
    console.log(e);
    document.getElementById("upload").innerHTML = "Upload Failed";
  }
}

function showimage() {
  const uniqueId = document.getElementById("unique").value.trim();
  if (!uniqueId) {
    alert("Unique Id is empty\n Please enter a Unique Id");
    return;
  }

  messagesRef
    .orderByChild("number")
    .equalTo(Number(uniqueId))
    .once("value")
    .then((snapshot) => {
      if (!snapshot.exists()) {
        alert("File not found. Check the Unique ID");
        return;
      }
      snapshot.forEach((child) => {
        const data = child.val();
        window.open(data.url, "_blank");

        // Remove DB record immediately
        messagesRef.child(child.key).remove();

        // Remove from storage after 15s
        setTimeout(() => {
          const sref = storage.refFromURL(data.url);
          sref.delete().catch(() => {});
        }, 15000);
      });
    });
}

function flesize() {
  const f = document.getElementById("file").files;
  if (f && f.size > 100000000) {
    alert("File size is greater than 100MB\n Please select a file less than 100MB");
    document.getElementById("file").value = "";
  }
}

// Press Enter to trigger download
document.getElementById("unique").addEventListener("keyup", function (event) {
  if (event.key === "Enter") document.getElementById("show").click();
});
