/*main.css*/
import './scss/complist.scss';
import './scss/compdetail.scss';
import './scss/home.scss';
import './scss/loginReg.scss';
import './scss/termsOfService.scss';
import './scss/decorationRaiders.scss';
import './scss/riji.scss';
import LoginReg from './script/loginReg.js';
LoginReg.login();
LoginReg.loginyanzheng();
$('#log a').on('click',function(){
	var i = $(this).index();
	localStorage.setItem('num',i);
})
