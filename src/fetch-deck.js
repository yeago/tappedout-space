const defaultSlug = `16-05-20-black-zombie`;

export const fetchDeck = async (slug = defaultSlug) => {
  console.log("fetchDeck called");
  const url = `https://tappedout.net/api/decks/${defaultSlug}/space/`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json, text/plain, */*",
      Cookie: [
        //"__cfduid=d2f0466390ee0e2871eebde9769c12aab1573000415",
        "csrftoken=Uvc8UJp29crrgBDlpXEAX1wtBLu9eBLAheUyGGBSPFZs1lIunmsIDKjOy2RYdl9D",
        //"_ga=GA1.2.1025053198.1588777946",
        //"_cb_ls=1",
        //"_cb=Bc_ZRQBObh8mBFVEuv",
        //"_chartbeat2=.1588777946365.1589899343111.10100000010111.BeRTPCDcPXAZBCOOoBDuXdi6BGEVrI.2",
        "CookieConsent=-1",
        //"_awl=2.1589899348.0.4-fa9e7299-d7c3b051d6cf8ef8833ae376f2df1b9f-6763652d75732d7765737431-5ec3f04f-0",
        //"__gads=ID=d8e1f83bc297fe9d:T=1588777947:S=ALNI_MbrcstOYjzX0CnXA0EZARYAY4pxmQ",
        "tapped=82g9ig0876ssbco91vdkwglgxm3z790a",
        //"_gid=GA1.2.1347356500.1589560174",
        //"crfgL0cSt0r=true",
        //"_cb_svref=null",
        //"_chartbeat4=t=01OpgChch_qDToalX7Nn9-DxRG7c&E=12&x=202&c=0.96&y=1240&w=767"
      ].join("; ")
    }
  });
};
