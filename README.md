# ReactRunning
A running / pacing calculator made with ReactJS and SASS. 

This is my practice project for ReactJS. Tutorials used are <a href="http://ccoenraets.github.io/es6-tutorial-react/setup/">here</a> and <a href="https://www.jonathan-petitcolas.com/2015/05/15/howto-setup-webpack-on-es6-react-application-with-sass.html">here (Webpack)</a>.

<a href="http://www.runnersworld.com/race-training/learn-how-to-run-negative-splits">Running with splits discussion.</a>

## Branches
The 'master' branch lets you choose the number of splits you want in your run. Branch 'perKM' increases or decreases your velocity with every kilometer.
 
## Get started (Ubuntu version)
You need the Node Package Manager and the Python package virtualenv:
```bash
apt install npm
pip install virtualenv
```
Clone the repository, change into a new virtual environment, install the dependencies and start the development server with the following terminal commands:
```bash
git clone https://github.com/EvelineV/ReactRunning
cd ReactRunning
virtualenv venv
source venv/bin/activate
npm install
npm start
```
Then view <a href="localhost:8080">localhost:8080</a> in your favourite browser

## Get started (Linux Mint version)
You need to install NodeJS-legacy:
```bash
apt install nodejs-legacy
```
and another virtual environment manager, for example conda. Otherwise, the Ubuntu instructions apply.
