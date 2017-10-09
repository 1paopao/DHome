/*main.css*/
import $ from 'n-zepto';
import './scss/complist.scss';
import './scss/compdetail.scss';
import './scss/rijidetail.scss';
/*公司列表*/
import Complist from './script/complist.js';
Complist.init();
/*公司详情*/
import Compdetail from './script/compdetail.js';
Compdetail.init();
Compdetail.detail();
import './scss/home.scss';
import './scss/loginReg.scss';
import './scss/termsOfService.scss';
import './scss/decorationRaiders.scss';
import './scss/riji.scss';
import './scss/fatie.scss';
import LoginReg from './script/loginReg.js';
LoginReg.login();
LoginReg.loginyanzheng();
$('#log a').on('click',function(){
	var i = $(this).index();
	localStorage.setItem('num',i);
})
