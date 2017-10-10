<<<<<<< HEAD
export default{
	fatie:function(){
		$('.tabs').each(function(i){
			$(this).click(function(){
				$(this).parent().css("border-color","red").siblings().css("border-color","#c9c9c9");
				switch (i){
					case 0:
						$('.user_info').css('display','block');
						$('.publish').css('display','none');
=======
$(function(){
	$('.tabs').each(function(i){
		$(this).click(function(){
			$(this).parent().css("border-color","red").siblings().css("border-color","#c9c9c9");
			switch (i){
				case 0:
					$('.user_info').css('display','block');
					$('.publish').css('display','none');
					$('.collection').css('display','none');
					$('.collection_detail').css('display','none');
					break;
				case 1:
					$('.user_info').css('display','none');
					$('.publish').css('display','block');
					$('.collection').css('display','none');
					$('.collection_detail').css('display','none	');
					break;
				case 2:
					$('.user_info').css('display','none');
					$('.publish').css('display','none');
					$('.collection').css('display','block');
					$('.collection').on('click','.clicks',function(){
>>>>>>> 2f7dce5ca9ff96443b6e42583e0172abc344222d
						$('.collection').css('display','none');
						$('.collection_detail').css('display','none');
						break;
					case 1:
						$('.user_info').css('display','none');
						$('.publish').css('display','block');
						$('.collection').css('display','none');
						$('.collection_detail').css('display','none	');
						break;
					case 2:
						$('.user_info').css('display','none');
						$('.publish').css('display','none');
						$('.collection').css('display','block');
						$('.collection').on('click','.clicks',function(){
							$('.collection').css('display','none');
							$('.collection_detail').css('display','block');
						})
						break;
					default:
						break;
				}
			})
		})
		//修改头像
		$(".file").on("change","input[type='muilt']",function(){
		    var filePath=$(this).val();
		    if(filePath.indexOf("jpg")!=-1 || filePath.indexOf("png")!=-1){
		//      $(".fileerrorTip").html("").hide();
		        var arr=filePath.split('\\');
		        var fileName=arr[arr.length-1];
		        console.log(fileName)
		        $(".url").attr('src',fileName);
		    }else{
		        $(".showFileName").html("");
		        $(".fileerrorTip").html("您未上传文件，或者您上传文件类型有误！").show();
		        return false 
		    }
		})
	
	}
}
