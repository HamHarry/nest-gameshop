/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import "./HomePage.css";
import "./DialogPromotion.css";
import "./DialogGame.css";
import { useAppDispatch } from "../store/store";
import {
  addGameDataSelector,
  getAllGamesPagination,
  gameLibarySelector,
  setAddGame,
  setSammary,
} from "../store/slices/gameSlice";
import { useSelector } from "react-redux";
import { setErrorMessage } from "../store/slices/appSlice";
import { useNavigate, useSearchParams } from "react-router-dom";

export interface ImageShow {
  image: string;
}

export interface GameItem {
  _id: string;
  type: string;
  name: string;
  price: number;
  image: string;
  imageShow: ImageShow[];
  isExist?: boolean;
  mode?: "out" | "store";
  __v?: number;
}

const HomePage = () => {
  const [openPromotion, setOpenPromotion] = useState<boolean>(true);
  const [openDialogGame, setOpenDialogGame] = useState<boolean>(false);
  const [dataGame, setDataGame] = useState<GameItem>();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchValue, setSearchValue] = useState<string>("");
  const [slide, setSlide] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  // list All Game
  const [listData, setListData] = useState<GameItem[]>([]);
  const [gamePromote, setGamePromote] = useState<GameItem>();

  const gameData = useSelector(addGameDataSelector);
  const gameLibary = useSelector(gameLibarySelector);
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  //! : search
  useEffect(() => {
    if (!searchParams.has("term")) {
      const queryParam = Object.fromEntries(searchParams.entries());
      setSearchParams({ ...queryParam, term: "" });
    } else {
      setSearchValue(searchParams.get("term") ?? "");
    }

    if (!searchParams.has("mode")) {
      const queryParam = Object.fromEntries(searchParams.entries());
      setSearchParams({ ...queryParam, mode: "store" });
    }

    if (!searchParams.has("type")) {
      const queryParam = Object.fromEntries(searchParams.entries());
      setSearchParams({ ...queryParam, type: "" });
    } else {
      setSelectedType(searchParams.get("type") ?? "");
    }
  }, [searchParams, setSearchParams]);

  const fetchGamesData = useCallback(async () => {
    try {
      showLoading();

      //! : search
      const body = Object.fromEntries(searchParams.entries());
      const gamesData = await dispatch(getAllGamesPagination(body)).unwrap();

      const gamePromote = gamesData[1];

      setListData(gamesData);
      setGamePromote(gamePromote);
    } catch (error) {
      console.log(error);
    } finally {
      hideLoading();
    }
  }, [dispatch, searchParams]);

  useEffect(() => {
    fetchGamesData();
  }, [fetchGamesData]);

  //reset ===================================================================
  //! : search
  const reset = () => {
    setSearchParams({ mode: "store", term: "", type: "" });
    setSelectedType("all");
    setSearchValue("");
  };

  //handle ===================================================================
  //! : search
  const handleonChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    const queryParam = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...queryParam, term: value });
    setSearchValue(value);
  };

  // render =================================================================
  const renderPromotion = () => {
    // เปลี่ยนรูปภาพ =============================================================
    const leftSlide = () => {
      const number =
        slide === 0 ? (gamePromote?.imageShow.length as any) - 1 : slide - 1;
      setSlide(number);
    };
    const rightSlide = () => {
      const number =
        slide === (gamePromote?.imageShow.length as any) - 1 ? 0 : slide + 1;
      setSlide(number);
    };

    const existGameLibary = gameLibary.find((item) => {
      return item.name === gamePromote?.name;
    });

    return (
      <dialog open={!existGameLibary && openPromotion}>
        <div className="warp-loding-background">
          <div className="dialogPromotion-container">
            <div className="nav-dialogPromotion">
              <i
                className="fa-solid fa-circle-xmark"
                onClick={() => {
                  setOpenPromotion(!openPromotion);
                }}
              ></i>
            </div>
            <div className="warp-dialogPromotion">
              {gamePromote && (
                <>
                  <h1>
                    New Game{" "}
                    <span className="text-red">{gamePromote?.name}</span>
                  </h1>
                  <div className="warp-image">
                    <div className="animation">
                      {gamePromote?.imageShow.map((item, index) => {
                        return (
                          <img
                            src={item.image}
                            alt="logo"
                            key={index}
                            className={
                              slide === index ? "slider" : "sliedr-hidden"
                            }
                          />
                        );
                      })}
                    </div>
                    <span className="indicators">
                      {gamePromote?.imageShow.map((_, index) => {
                        return (
                          <button
                            key={index}
                            className={
                              slide === index ? "indicator" : "indicator-hidden"
                            }
                            onClick={() => {
                              setSlide(index);
                            }}
                          />
                        );
                      })}
                    </span>
                    <i
                      className="fa-solid fa-circle-left"
                      onClick={leftSlide}
                    ></i>
                    <i
                      className="fa-solid fa-circle-right"
                      onClick={rightSlide}
                    ></i>
                  </div>
                  <div
                    className="btn-promotion"
                    onClick={() => {
                      return console.log(gamePromote);
                    }}
                  >
                    <button
                      onClick={() => {
                        const prevGame = gameData.find((game) => {
                          return game.name === gamePromote.name;
                        });
                        if (prevGame) {
                          dispatch(
                            setErrorMessage(
                              `Game ${gamePromote.name} is already in the cart.`
                            )
                          );
                        } else {
                          dispatch(setAddGame(gamePromote));
                          dispatch(setSammary());
                          navigate("/core/home/payment");
                        }
                      }}
                    >
                      Buy
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </dialog>
    );
  };
  const renderDialogGame = () => {
    const game = dataGame;

    // เปลี่ยนรูปภาพ =============================================================
    const leftSlide = () => {
      const number =
        slide === 0 ? (game?.imageShow.length as any) - 1 : slide - 1;
      setSlide(number);
    };
    const rightSlide = () => {
      const number =
        slide === (game?.imageShow.length as any) - 1 ? 0 : slide + 1;
      setSlide(number);
    };

    return (
      <dialog open={openDialogGame}>
        <div className="warp-loding-background">
          {game && (
            <div className="dialogGame-container">
              <div className="dialogGame-nav">
                <h1>{game.name}</h1>
                <i
                  className="fa-solid fa-circle-xmark"
                  onClick={() => {
                    setOpenDialogGame(!openDialogGame);
                    setDataGame(undefined);
                    setSlide(0);
                  }}
                ></i>
              </div>
              <div className="warp-image-game">
                <div className="animation">
                  {game.imageShow.map((item, index) => {
                    return (
                      <img
                        src={item.image}
                        alt="logo"
                        key={index}
                        className={slide === index ? "slider" : "sliedr-hidden"}
                      />
                    );
                  })}
                </div>
                <span className="indicators-game">
                  {game.imageShow.map((_, index) => {
                    return (
                      <button
                        key={index}
                        className={
                          slide === index ? "indicator" : "indicator-hidden"
                        }
                        onClick={() => {
                          setSlide(index);
                        }}
                      />
                    );
                  })}
                </span>
                <div className="btn-left-right">
                  <i
                    className="fa-solid fa-circle-left"
                    onClick={leftSlide}
                  ></i>
                  <i
                    className="fa-solid fa-circle-right"
                    onClick={rightSlide}
                  ></i>
                </div>
              </div>
              <div className="price">
                <h2>
                  {game.price <= 0
                    ? "Free"
                    : `${Intl.NumberFormat().format(game.price)} THB`}
                </h2>
              </div>
              <div className="btn-dialogGame">
                <button
                  className={game.isExist ? "dis-btn-add" : "btn-add-game"}
                  disabled={game.isExist}
                  onClick={() => {
                    const prevGame = gameData.find(
                      (item) => item.name === game.name
                    );
                    if (prevGame) {
                      dispatch(
                        setErrorMessage(
                          `Game ${game.name} is already in the cart.`
                        )
                      );
                    } else {
                      setOpenDialogGame(!openDialogGame);
                      dispatch(setAddGame(game));
                      dispatch(setSammary());
                      setDataGame(undefined);
                    }
                  }}
                >
                  Add to Cart
                </button>
                <button
                  className={game.isExist ? "dis-btn-buy" : "btn-buy-game"}
                  disabled={game.isExist}
                  onClick={() => {
                    const prevGame = gameData.find((item) => {
                      return item.name === game.name;
                    });
                    if (prevGame) {
                      dispatch(
                        setErrorMessage(
                          `Game ${game.name} is already in the cart.`
                        )
                      );
                    } else {
                      dispatch(setAddGame(game));
                      dispatch(setSammary());
                      navigate("/core/home/payment");
                      setDataGame(undefined);
                    }
                  }}
                >
                  Buy
                </button>
              </div>
            </div>
          )}
        </div>
      </dialog>
    );
  };

  //! : search
  const renderChoises = () => {
    return (
      <div className="choise">
        <button
          className={
            selectedType === "open world"
              ? "is-choise-open-world"
              : "choise-open-world"
          }
          onClick={() => {
            const queryParam = Object.fromEntries(searchParams.entries());
            setSearchParams({ ...queryParam, type: "open world" });
            setSelectedType("open world");
          }}
        >
          Open World
        </button>
        <button
          className={selectedType === "fps" ? "is-choise-fps" : "choise-fps"}
          onClick={() => {
            const queryParam = Object.fromEntries(searchParams.entries());
            setSearchParams({ ...queryParam, type: "fps" });
            setSelectedType("fps");
          }}
        >
          FPS
        </button>
        <button
          className={
            selectedType === "survive" ? "is-choise-survive" : "choise-survive"
          }
          onClick={() => {
            const queryParam = Object.fromEntries(searchParams.entries());
            setSearchParams({ ...queryParam, type: "survive" });
            setSelectedType("survive");
          }}
        >
          Survival
        </button>
        <button
          className={selectedType === "moba" ? "is-choise-moba" : "choise-moba"}
          onClick={() => {
            const queryParam = Object.fromEntries(searchParams.entries());
            setSearchParams({ ...queryParam, type: "moba" });
            setSelectedType("moba");
          }}
        >
          Moba
        </button>
      </div>
    );
  };

  return (
    <div className="container-hompage">
      <div className="warp-container-homepage">
        <div className="header">
          <h1>Welcome to Game Store</h1>
        </div>
        <div className="container-table">
          <div className="table-nav">
            {renderChoises()}
            <div className="table-nav-search">
              <input
                value={searchValue}
                type="text"
                placeholder="Search...."
                onChange={handleonChangeSearch}
              />
              <i
                className="fa-solid fa-arrow-rotate-left"
                onClick={() => {
                  reset();
                }}
              ></i>
            </div>
          </div>
          <div className="table-game">
            <div className="table">
              {listData.map((item, index) => {
                const existGameLibary = gameLibary.find((game) => {
                  return game.name === item.name;
                });
                return (
                  <div key={index} className="gird-game">
                    <div className="imagegame">
                      <img
                        src={item.image}
                        alt="logo"
                        onClick={() => {
                          const newItem = {
                            ...item,
                            isExist: Boolean(existGameLibary),
                          };
                          setDataGame(newItem);
                          setOpenDialogGame(!openDialogGame);
                        }}
                      />
                    </div>
                    <div className="namegame">
                      <h3>{item.name}</h3>
                    </div>
                    <div className="pricegame">
                      <h3>
                        {item.price <= 0
                          ? "Free"
                          : `${Intl.NumberFormat().format(item.price)} THB`}
                      </h3>
                    </div>
                    <button
                      className={existGameLibary ? "dis-btn" : "btn-buy"}
                      onClick={() => {
                        if (existGameLibary) return;
                        const prevGame = gameData.find((game) => {
                          return game.name === item.name;
                        });
                        if (prevGame) {
                          dispatch(
                            setErrorMessage(
                              `Game ${item.name} is already in the cart.`
                            )
                          );
                        } else {
                          dispatch(setAddGame(item));
                          dispatch(setSammary());
                          navigate("/core/home/payment");
                        }
                      }}
                    >
                      Buy
                    </button>
                  </div>
                );
              })}
            </div>
            {listData.length > 0 && renderPromotion()}
            {renderDialogGame()}
          </div>
        </div>
      </div>
      {isLoading && (
        <div className="wrap-loding">
          <div className="loding" />
        </div>
      )}
    </div>
  );
};

export default HomePage;
