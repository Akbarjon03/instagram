import React from "react";
import styled from "styled-components";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { SetSelectedProfile } from "../../appSlice";

function PersonalInfoCard({ user }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const visitProfile = () => {
    dispatch(
      SetSelectedProfile({
        selectedProfile: {
          userProfile: user.photoURL,
          userId: user.uid,
          username: user.displayName,
        },
      })
    );
    navigate("/profile");
  };
  return (
    <CardWrapper>
      <UserInfoWrap>
        <img src={user?.photoURL} alt="" onClick={visitProfile} />
        <section>
          <h5 onClick={visitProfile}>
            <strong>{user?.displayName}</strong>
          </h5>
          <p>Welcome to the Instagram</p>
        </section>
      </UserInfoWrap>
      <h4 onClick={() => auth.signOut()}>SignOut</h4>
    </CardWrapper>
  );
}

export default PersonalInfoCard;
const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 25px 0;
  @media (min-width: 900px) {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  > h4 {
    cursor: pointer;
    color: #4299e1;
    font: 20px;
    display: none;
    @media (min-width: 1200px) {
      display: block;
    }
  }
`;
const UserInfoWrap = styled.div`
  display: flex;
  align-items: center;
  > img {
    object-fit: contain;
    height: 60px;
    width: 60px;
    border-radius: 9999px;
    margin-right: 15px;
    cursor: pointer;
  }
  > section {
    flex: 1;
  }
  > section > p {
    color: gray;
    font-size: 15px;
  }
  > section > h5 {
    color: rgb(115 115 115);
    cursor: pointer;
  }
`;
