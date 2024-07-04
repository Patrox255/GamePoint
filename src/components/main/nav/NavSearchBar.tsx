import { useState } from "react";
import Input from "../../UI/Input";
import { useQuery } from "@tanstack/react-query";
import { load10GamesByQuery } from "../../../lib/fetch";
import LoadingFallback from "../../UI/LoadingFallback";
import Error from "../../UI/Error";
import PriceTag from "../../game/PriceTag";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import slugify from "slugify";
// import { NavSearchBarContext } from "../../UI/Nav";
import { useInput } from "../../../hooks/useInput";
import { useAppSelector } from "../../../hooks/reduxStore";
import { actions } from "../../../store/mainSearchBarSlice";

export default function NavSearchBar({ placeholder }: { placeholder: string }) {
  // const { searchTerm, setSearchTerm } = useContext(NavSearchBarContext);
  const searchTerm = useAppSelector(
    (state) => state.mainSearchBarSlice.searchTerm
  );
  actions.setSearchTerm;
  const { handleInputChange } = useInput({
    stateValue: searchTerm,
    setStateAction: actions.setSearchTerm,
  });

  const { data, isLoading, error, isError } = useQuery({
    queryFn: ({ signal }) => load10GamesByQuery(searchTerm!, signal),
    queryKey: ["games", "search", searchTerm],
    enabled: searchTerm !== "",
  });

  const [showResults, setShowResults] = useState<boolean>(false);

  function handleInputBlur() {
    setShowResults(false);
  }
  function handleInputFocus() {
    setShowResults(true);
  }

  return (
    <div className="flex w-2/5 justify-end flex-col relative">
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={handleInputFocus}
      />
      {(data || isLoading || isError) && showResults && (
        <motion.div
          className="bg-darkerBg py-5 absolute bottom-0 w-full translate-y-[100%] flex justify-center overflow-y-scroll overflow-x-clip max-h-[70vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {data && data.data.length !== 0 && (
            <motion.ul
              className="w-full grid gap-2 text-center"
              variants={{
                highlighted: {
                  opacity: 1,
                },
                normal: {
                  opacity: 1,
                },
                disappear: {
                  opacity: 0,
                },
              }}
              initial="disappear"
              animate="normal"
            >
              <AnimatePresence>
                {data.data.map((game) => (
                  <motion.li
                    key={game.title}
                    variants={{
                      highlighted: {
                        opacity: 1,
                        x: 10,
                      },
                      normal: {
                        opacity: 0.8,
                        x: 0,
                        scale: 1,
                      },
                      disappear: {
                        opacity: 0,
                        x: 0,
                        scale: 1.5,
                      },
                    }}
                    initial="disappear"
                    animate="normal"
                    exit="disappear"
                    whileHover="highlighted"
                    layout
                  >
                    <Link
                      className="w-full grid grid-cols-gameSearchBarResult items-center gap-2 px-6"
                      to={`/products/${slugify(game.title, { lower: true })}`}
                    >
                      <figure className="grid grid-cols-2 items-center gap-2 justify-center">
                        {game.artworks.length !== 0 ? (
                          <img
                            src={game.artworks[0].replace("720p", "logo_med")}
                            className="m-auto h-auto"
                          />
                        ) : (
                          <div className="py-6">
                            Failed to retrieve image of the game
                          </div>
                        )}

                        <figcaption>
                          <h2 className="text-highlightRed font-bold text-lg min-w-2/5">
                            {game.title}
                          </h2>
                        </figcaption>
                      </figure>
                      <PriceTag
                        price={game.price}
                        discount={game.discount}
                        startAnimation
                        removeOriginalPriceAfterAnimation
                      />
                    </Link>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
          {data && data.data.length === 0 && (
            <p>There are no games which match with the provided query</p>
          )}
          {isLoading && <LoadingFallback />}
          {isError && <Error message={error.message} />}
        </motion.div>
      )}
    </div>
  );
}
