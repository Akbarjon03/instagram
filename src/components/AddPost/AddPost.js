import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { CameraIcon } from "@heroicons/react/outline";
import { addDoc, doc, updateDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth, storage } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, getDownloadURL, uploadString } from "firebase/storage";
import { useDispatch } from "react-redux";
import { setAddPostModal } from "../../appSlice";
import Spinner from "react-spinkit";
import "../AddPost/AddPost.css"

function AddPost() {
  const [user] = useAuthState(auth);
  const filePickerRef = useRef(null);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const modalContentRef = useRef();

  useEffect(() => {
    const handler = (event) => {
      if (!modalContentRef.current.contains(event.target)) {
        dispatch(
          setAddPostModal({
            addPostIsOpen: false,
          })
        );
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  });

  const uploadPost = async () => {
    if (loading) return;
    setLoading(true);

    const docRef = await addDoc(collection(db, "posts"), {
      username: user.displayName,
      userId: user.uid,
      caption: caption,
      profileImg: user.photoURL,
      timestamp: serverTimestamp(),
    });
    setCaption("");
    const imageRef = ref(storage, `posts/${docRef.id}/image`);

    await uploadString(imageRef, selectedFile, "data_url").then(
      async (snapshot) => {
        const downloadURL = await getDownloadURL(imageRef);
        await updateDoc(doc(db, "posts", docRef.id), {
          image: downloadURL,
        });
      }
    );

    dispatch(
      setAddPostModal({
        addPostIsOpen: false,
      })
    );
    setLoading(false);
    setSelectedFile(null);
  };

  const addImageToPost = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      setSelectedFile(readerEvent.target.result);
    };
  };

  return (
    <div className="AddPostWrapper">
      <div className="ModalContentWrapper" ref={modalContentRef}>
        <ContentContainer>
          {selectedFile ? (
            <img
              src={selectedFile}
              alt=""
              style={{
                objectFit: "contain",
                cursor: "pointer",
                maxHeight: 200,
                width: "100%",
                borderRadius: 5,
              }}
            />
          ) : (
            <CameraIcon
              onClick={() => filePickerRef.current.click()}
              style={{
                color: "#e53e3e",
                padding: 15,
                borderRadius: 9999,
                background: "#f2dfdf",
                cursor: "pointer",
                height: 30,
              }}
            />
          )}
          <p
            style={{
              padding: 5,
              fontSize: 21,
              fontWeight: 805,
              color: "rgb(39 39 39)",
              textAlign: "center",
              border: 0,
            }}
          >
            Select a photo
          </p>
          {/* caption */}
          <input
            placeholder="Enter caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={{
              padding: 5,
              color: "#4a5568",
              textAlign: "center",
              border: 0,
              fontSize: 15,
            }}
          />

          <input
            ref={filePickerRef}
            type="file"
            hidden
            onChange={addImageToPost}
          />

          {loading ? (
            <Spinner
              name="ball-spin-fade-loader"
              color="purple"
              fadeIn="none"
            />
          ) : (
            <button
              type="submit"
              disabled={!selectedFile}
              onClick={uploadPost}
              className={selectedFile ? "selected" : "notSelected"}
            >
              POST
            </button>
          )}
        </ContentContainer>
      </div>
    </div>
  );
}

export default AddPost;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
  > button {
    font-weight: 600;
    width: 60%;
    padding: 10px;
    cursor: pointer;
    margin-top: 5px;
    border: none;
    border-radius: 5px;
  }
`;
