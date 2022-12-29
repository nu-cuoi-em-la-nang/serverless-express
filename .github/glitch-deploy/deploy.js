const upload_Md = require('./git-push.js');
const createNew_Md = require('./newCreate.js')
const shell = require('shelljs')
const queryString = require('query-string');
const axios = require("axios").default;
const axiosRetry = require('axios-retry');

setTimeout(() => {
  console.log('force exit');
  process.exit(0)
}, 30 * 60 * 1000);

axiosRetry(axios, {
  retries: 100,
  retryDelay: (retryCount) => {
    // console.log(`retry attempt: ${retryCount}`);
    return 3000 || retryCount * 1000;
  },
  retryCondition: (error) => {
    return error.response.status === 502;
  },
});


const listProject = `https://34007a45-fb7c-4b41-bf5b-c568d29921d7@api.glitch.com/git/discovered-subsequent-germanium|https://34007a45-fb7c-4b41-bf5b-c568d29921d7@api.glitch.com/git/abstracted-woozy-pigment|https://34007a45-fb7c-4b41-bf5b-c568d29921d7@api.glitch.com/git/spotty-six-braid|https://34007a45-fb7c-4b41-bf5b-c568d29921d7@api.glitch.com/git/iron-internal-hexagon|https://34007a45-fb7c-4b41-bf5b-c568d29921d7@api.glitch.com/git/fortune-nimble-jingle|https://34007a45-fb7c-4b41-bf5b-c568d29921d7@api.glitch.com/git/cottony-ninth-peanut|https://34007a45-fb7c-4b41-bf5b-c568d29921d7@api.glitch.com/git/thread-fluoridated-jacket|https://34007a45-fb7c-4b41-bf5b-c568d29921d7@api.glitch.com/git/silver-blushing-dogwood|https://34007a45-fb7c-4b41-bf5b-c568d29921d7@api.glitch.com/git/clean-puddle-nautilus|https://34007a45-fb7c-4b41-bf5b-c568d29921d7@api.glitch.com/git/chain-fuzzy-parent|https://34007a45-fb7c-4b41-bf5b-c568d29921d7@api.glitch.com/git/neat-palm-agreement|https://34007a45-fb7c-4b41-bf5b-c568d29921d7@api.glitch.com/git/nonchalant-overjoyed-epoch|https://34007a45-fb7c-4b41-bf5b-c568d29921d7@api.glitch.com/git/splendid-trusted-situation|https://34007a45-fb7c-4b41-bf5b-c568d29921d7@api.glitch.com/git/fern-shiny-match`.trim().split('|');

const delay = t => {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(true);
    }, t);
  });
};

(async () => {
  try {
    let accountNumber = 0;

    for (let i = 0; i < listProject.length; i++) {
      accountNumber = i + 1;
      try {
        const nameProject = listProject[i].split('/')[4]
        console.log('deploy', nameProject);
        createNew_Md.run(nameProject)
        await upload_Md.upload2Git(listProject[i].trim(), 'code4Delpoy');
        console.log(`account ${accountNumber} upload success ^_^`);

        axios
          .get(`https://eager-profuse-python.glitch.me/deploy?${queryString.stringify({
            email: listProject[i].trim() + ' true'
          })}`)
          .then((response) => {
            console.log(response.data);
          })
          .catch((error) => {
            if (error.response) {
              console.log(error.response.data);
            } else {
              console.log('Loi');
            }
          });

        if (i + 1 < listProject.length) await delay(1.8 * 60 * 1000);
      } catch (error) {
        console.log(`account ${accountNumber} upload fail ^_^`);
        axios
          .get(`https://eager-profuse-python.glitch.me/deploy?${queryString.stringify({
            email: listProject[i].trim() + ' false'
          })}`)
          .then((response) => {
            console.log(response.data);
          })
          .catch((error) => {
            if (error.response) {
              console.log(error.response.data);
            } else {
              console.log('Loi');
            }
          });
      }

      if (process.cwd().includes('code4Delpoy')) shell.cd('../', { silent: true });

    }

    await delay(20000)
    console.log('Done! exit')
    process.exit(0)

  } catch (err) {
    console.log(`error: ${err}`);
  }
})();