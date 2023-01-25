import React from "react";
import styled from "styled-components";
import PersonalInfoCard from "../PersonalInfoCard/PersonalInfoCard";
import { useSelector } from "react-redux";
import { selectMobile, selectPosts } from "../../appSlice";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import Post from "../../components/Post/Post";
import "../Feed/Feed.css";

function Feed() {
  const mobile = useSelector(selectMobile);
  const posts = useSelector(selectPosts);
  const [user] = useAuthState(auth);

  return (
    <div className="FeedContainer">
      <div className="container">
        <PostsContainer>
          {posts?.map((post) => (
            <Post post={post} key={post.id} user={user} />
          ))}
        </PostsContainer>
      </div>
      {!mobile ? (
        <div className="Widgets">
          <PersonalInfoCard user={user} />
          <SuggestionsContainer>
            <SuggestionsHeader>
              <h4>Suggestions For You</h4>
              <p>See All</p>
            </SuggestionsHeader>
          </SuggestionsContainer>
          <p style={{ color: "rgb(212 212 216)", fontSize: 13, marginTop: 50 }}>
            2023 INSTAGRAM BY META
          </p>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default Feed;
const PostsContainer = styled.div``;
const SuggestionsContainer = styled.div``;
const SuggestionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  > p {
    font-weight: 100;
  }
  h4 {
    color: gray;
  }
`;
