import Header from "./components/Header/Header";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { auth, db } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { selectAddPostIsOpen, SetScreen, SetPosts } from "./appSlice";
import { useTransition, animated } from "react-spring";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Routes, Route } from "react-router-dom";
import Profile from "./components/Profile/Profile";
import Feed from "./components/Feed/Feed";
import Login from "./components/Auth/Login";
import AddPost from "./components/AddPost/AddPost";
import "../src/App.css"

function App() {
  const dispatch = useDispatch();
  const [user] = useAuthState(auth);
  const addPostIsOpen = useSelector(selectAddPostIsOpen);

  const addPostTransition = useTransition(addPostIsOpen, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  useEffect(() => {
    window.addEventListener("resize", checkScreenSize);
    function checkScreenSize() {
      if (window.innerWidth >= 750) {
        dispatch(
          SetScreen({
            mobile: false,
          })
        );
      } else if (window.innerWidth <= 750) {
        dispatch(
          SetScreen({
            mobile: true,
          })
        );
      }
    }
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "posts"), orderBy("timestamp", "desc")),
      (snapshot) => {
        dispatch(
          SetPosts({
            posts: snapshot.docs,
          })
        );
      }
    );
    return () => {
      unsubscribe();
    };
  });

  return (
    <div className="AppContainer">
      {!user ? (
        <Login />
      ) : (
        <>
          <Header />
          <div className="BodyWrapper">
            <Routes>
              <Route exact path="/" element={<Feed />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
          {addPostTransition(
            (styles, item) =>
              item && (
                <animated.div style={styles}>
                  <AddPost />
                </animated.div>
              )
          )}
        </>
      )}
    </div>
  );
}

export default App;