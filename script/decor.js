export default {
//	chaxun
	decorChange:function(){
		var constant = 12;//常量
		var total = 48;
		var index = total/constant;
		var num = 0;
		if(sessionStorage.getItem('caseStyle')){
			total = sessionStorage.getItem('caseStyle');
		}
		Ajax('田园')
		$('#decRai2').on('click','li',function(){
			var i = $(this).index();
			var n = Array.from($('#decRai2 li strong'));
			console.log(n[i].innerText)
			Ajax(n[i].innerText);
		})
		
		
		
		console.log(total);
		
		function Ajax(n){
			$.ajax({
				type:"get",
				data:{'case_style':n},
				url:"http://www.drehome.com/dreamhome/case",
				async:true,
				success:function(data){
					console.log(data);
					total = data.data.length;
					
				}
			});
		}
		//分页效果
		$('#dere-right').on('click',function(){
			num++;
			if(num>=total){
				num=total;
			}
			console.log(111)
			
			$('#dere1').html(num);
		})
		
		$('#dere-left').on('click',function(){
			num--;
			if(num<=0){
				num=0;
			}
			console.log(111)
			
			$('#dere1').html(num);
		})
		$('#dere2').html(total);
		$('#dere1').html(num);
	}
	
	
}