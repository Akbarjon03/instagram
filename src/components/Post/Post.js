import React, { useEffect } from "react";
import { DotsHorizontalIcon } from "@heroicons/react/solid";
import { HeartIcon, PaperAirplaneIcon, ChatIcon, BookmarkIcon, TrashIcon, UserCircleIcon, XIcon } from "@heroicons/react/outline";
import { HeartIcon as HeartIconFilled } from "@heroicons/react/solid";
import { MdSentimentVerySatisfied } from "react-icons/md";
import styled from "styled-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useDispatch } from "react-redux";
import { SetSelectedProfile } from "../../appSlice";
import moment from "moment";

function Post({ post, user }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [hasLiked, setHasLiked] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    onSnapshot(
      query(
        collection(db, "posts", post.id, "comments"),
        orderBy("timestamp", "desc")
      ),
      (snapshot) => {
        setComments(snapshot.docs);
      }
    );
  }, [post.id]);

  useEffect(
    () =>
      onSnapshot(collection(db, "posts", post.id, "likes"), (snapshot) =>
        setLikes(snapshot.docs)
      ),
    [post.id]
  );

  useEffect(
    () => setHasLiked(likes.findIndex((like) => like.id === user.uid) !== -1),
    [likes, user.uid]
  );

  const likePost = async () => {
    if (hasLiked) {
      await deleteDoc(doc(db, "posts", post.id, "likes", user.uid));
    } else {
      await setDoc(doc(db, "posts", post.id, "likes", user.uid), {
        username: user?.displayName,
      });
    }
  };
  const addComment = async (e) => {
    e.preventDefault();
    if (comment !== "") {
      await addDoc(collection(db, "posts", post.id, "comments"), {
        username: user.displayName,
        comment: comment,
        profileImg: user.photoURL,
        timestamp: serverTimestamp(),
      });
    }

    setComment("");
  };

  const visitProfile = () => {
    dispatch(
      SetSelectedProfile({
        selectedProfile: {
          userProfile: post.data().profileImg,
          userId: post.data().userId,
          username: post.data().username,
        },
      })
    );
    navigate("/profile");
  };
  const deletePost = () => {
    deleteDoc(doc(db, "posts", post.id));
  };
  return (
    <PostWrap>
      <HeaderContainer>
        <img src={post.data().profileImg} alt="" onClick={visitProfile} />
        <p onClick={visitProfile}>{post.data().username}</p>
        {!isOpen ? (
          <DotsHorizontalIcon
            onClick={() => setIsOpen(!isOpen)}
            style={{ width: 24, color: "gray", cursor: "pointer" }}
          />
        ) : (
          <XIcon
            onClick={() => setIsOpen(!isOpen)}
            style={{ width: 18, color: "black", cursor: "pointer" }}
          />
        )}

        {isOpen && (
          <DotsOptions>
            <li onClick={visitProfile}>
              <UserCircleIcon className="Icon" /> View profile
            </li>
            {post.data().userId === user.uid && (
              <li onClick={deletePost} style={{ color: "rgb(239 68 68)" }}>
                <TrashIcon className="Icon" /> Delete
              </li>
            )}
          </DotsOptions>
        )}
      </HeaderContainer>
      {/* POST PHOTO */}
      <PostCoverPhoto src={post.data().image} />
      {/* POST OPTIONS */}
      <PostOptions>
        <div style={{ display: "flex", gap: 15 }}>
          {hasLiked ? (
            <HeartIconFilled
              className="Nav__Icon"
              onClick={likePost}
              style={{ paddingLeft: 10, color: "#f56565" }}
            />
          ) : (
            <HeartIcon
              className="Nav__Icon"
              onClick={likePost}
              style={{ paddingLeft: 10 }}
            />
          )}
          <ChatIcon className="Nav__Icon" />
          <PaperAirplaneIcon className="Nav__Icon" />
        </div>
        <BookmarkIcon className="Nav__Icon" />
      </PostOptions>
      {/* LIKES */}
      <p style={{ paddingLeft: 10 }}>
        {likes.length > 0 && (
          <strong>
            {likes.length} {likes.length > 1 ? "Likes" : "Like"}
          </strong>
        )}
      </p>
      {/* DETAILS & CAPTION */}
      <p style={{ display: "flex", gap: 10, marginTop: 5, padding: 10 }}>
        <strong>{post.data().username}</strong>
        <span>{post.data().caption}</span>
      </p>
      {/* COMMENTs */}
      {comments.length !== 0 && (
        <CommentsContainer>
          {comments?.map((comment) => (
            <CommentWrapper key={comment.id}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <img src={comment.data().profileImg} alt="" />
                <h5>
                  <strong>{comment.data().username}</strong>
                </h5>
                <p>{comment.data().comment}</p>
              </div>

              {comment && (
                <p style={{ fontSize: 10, color: "gray" }}>
                  {moment(comment.data().timestamp?.toDate()).fromNow()}
                </p>
              )}
            </CommentWrapper>
          ))}
        </CommentsContainer>
      )}
      {post && (
        <div style={{ padding: 10, color: "gray", fontSize: 12 }}>
          <p> {moment(post.data().timestamp?.toDate()).fromNow()}</p>
        </div>
      )}
      {/* ADD COMMENT */}
      <AddCommentContainer>
        <div>
          <MdSentimentVerySatisfied style={{ height: 30 }} />
          <form onSubmit={addComment}>
            <input
              value={comment}
              type="text"
              placeholder="Add comment"
              onChange={(e) => {
                setComment(e.target.value);
              }}
            />
            <button type="submit">Send</button>
          </form>
        </div>
        <h4 style={{ cursor: "pointer" }} onClick={addComment}>
          Post
        </h4>
      </AddCommentContainer>
    </PostWrap>
  );
}

export default Post;
const PostWrap = styled.div`
  background-color: #fff;
  margin-bottom: 30px;
  border: 1px solid rgb(212 212 212);
`;

const HeaderContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 10px;
  > img {
    object-fit: contain;
    height: 40px;
    width: 40px;
    border-radius: 9999px;
    cursor: pointer;
  }
  > p {
    flex: 1;
    font-size: 15px;
    cursor: pointer;
    font-weight: 500;
  }
`;
const DotsOptions = styled.ul`
  position: absolute;
  background-color: #fff;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  padding: 10px;
  right: 20px;
  top: 40px;
  > li {
    display: flex;
    align-items: center;
    font-weight: 500;
    gap: 10px;
    padding: 10px;
    cursor: pointer;
  }
`;

const PostCoverPhoto = styled.img`
  object-fit: contain;
  width: 100%;
`;
const PostOptions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #000;
  width: 100%;
`;
const CommentsContainer = styled.div`
  max-height: 70px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px;
  margin-left: 35px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-right: 5px;

  ::-webkit-scrollbar {
    width: 10px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #000;
  }
`;
const CommentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  > div > img {
    object-fit: contain;
    height: 30px;
    border-radius: 9999px;
  }
  > div > p {
    color: #2d3748;
    font-size: 15px;
    height: 20px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 150px;

    @media (min-width: 750px) {
      width: 250px;
    }
  }
  > p {
    min-width: 50px;
    height: 18px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    @media (min-width: 750px) {
      width: auto;
    }
  }
`;
const AddCommentContainer = styled.div`
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  color: gray;
  > div {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  > div > form > input {
    border: 0px;
    font-size: 15px;
    flex: 1;
    :focus {
      outline: none;
    }
  }
  > div > form > button {
    display: none;
    cursor: pointer;
  }
`;