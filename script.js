const firebaseConfig = {
  apiKey: "AIzaSyBPlnG8AQWAQS5O0TFFnIHyw2DfiNqAHfM",
  authDomain: "image-share-4446c.firebaseapp.com",
  projectId: "image-share-4446c",
  storageBucket: "image-share-4446c.appspot.com",
  messagingSenderId: "424462799129",
  appId: "1:424462799129:web:33b634c2a607aa72cb3588",
  measurementId: "G-31PPT6CB61"
};
firebase.initializeApp(firebaseConfig);

// Database reference
var messagesRef = firebase.database().ref("image");

// Loader helpers
function showLoader(id){ const img = document.getElementById(id); if(img){ img.style.display="inline-block"; img.style.width="18px"; img.style.height="18px"; } }
function hideLoader(id){ const img = document.getElementById(id); if(img){ img.style.display="none"; } }

// Upload
function uploadImage(){
  const fileInput = document.getElementById("file");
  if(!fileInput.files.length){ alert("Please select a file"); return; }

  const file = fileInput.files[0];
  const storageRef = firebase.storage().ref("images/"+file.name);

  const btnText = document.getElementById("upload").querySelector("span");
  showLoader("uping"); btnText.textContent="Uploading...";

  storageRef.put(file).on("state_changed",
    snapshot=>{
      const progress = ((snapshot.bytesTransferred/snapshot.totalBytes)*100).toFixed(2);
      btnText.textContent="Uploading "+progress+"%...";
    },
    error=>{
      btnText.textContent="Upload Failed"; hideLoader("uping"); console.log(error);
    },
    ()=>{
      storageRef.getDownloadURL().then(url=>{
        saveMessage(url);
        btnText.textContent="Upload Successful"; hideLoader("uping");
        fileInput.value = "";
      });
    }
  );
}

// Save unique ID
function saveMessage(url){
  const unique = Math.floor(10000+Math.random()*90000);
  const newRef = messagesRef.push();
  newRef.set({ url, number: unique });

  document.getElementById("ShowUniqueID").style.display="block";
  document.getElementById("showunique").value=unique;

  // Hide download section temporarily
  document.getElementById("downloadiv").style.display="none";
}

// Download
function showimage(){
  const id = document.getElementById("unique").value;
  if(!id){ alert("Enter Unique ID"); return; }

  const btnText = document.getElementById("show").querySelector("span");
  showLoader("downimg"); btnText.textContent="Fetching...";

  messagesRef.once("value", snap=>{
    let found=false;
    snap.forEach(child=>{
      const data=child.val();
      if(data.number==id){
        found=true;
        window.open(data.url,"_blank");
        // Delete from storage & DB
        firebase.storage().refFromURL(data.url).delete().catch(()=>{});
        messagesRef.child(child.key).remove();
      }
    });
    hideLoader("downimg");
    btnText.textContent=found?"Downloaded":"Not Found";
    if(!found){ setTimeout(()=>{ btnText.textContent="Download"; },2000); }
  });
}

// File size check
function flesize(){
  const file=document.getElementById("file").files[0];
  if(file && file.size>100000000){ alert("Max 100MB"); document.getElementById("file").value=""; }
}

// Press Enter to download
document.getElementById("unique").addEventListener("keyup",e=>{
  if(e.key==="Enter"){ document.getElementById("show").click(); }
});
