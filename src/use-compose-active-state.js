import { useMemo, useReducer, } from "./packages.js";

const composeActiveReducer = type => {
  return (state, action) => {
    switch (action.type) {
      case `ON-${type}`: {
        return action.value;
      }
      case `OFF-${type}`: {
        return state === action.value ? null : state;
      }
      case `RESET`: {
        return null;
      }
      default: {
        return state;
      }
    }
  };
};

const useComposeActions = (dispatch, type) => {
  return useMemo(
    () => ({
      on: value => {
        dispatch({ type: `ON-${type}`, value });
      },
      off: value => {
        dispatch({ type: `OFF-${type}`, value });
      },
      reset: () => dispatch({ type: 'RESET' })
    }),
    [dispatch, type]
  );
};

export const useComposeActiveState = (type, initialState = null) => {
  const reducer = useMemo(() => {
    return composeActiveReducer(type);
  }, [type]);
  const [value, dispatch] = useReducer(reducer, initialState);
  const actions = useComposeActions(dispatch, type);
  return { value, ...actions };
};
