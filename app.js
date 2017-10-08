/*main.css*/
import './scss/complist.scss';
import './scss/compdetail.scss';
import './scss/rijidetail.scss';
/*公司列表*/
import Complist from './script/complist.js';
Complist.init();
/*公司详情*/
import Compdetail from './script/compdetail.js';
Compdetail.init();

import './scss/home.scss';
import './scss/loginReg.scss';
import './scss/termsOfService.scss';
import './scss/riji.scss';
import LoginReg from './script/loginReg.js';
LoginReg.login();
