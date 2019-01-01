<?php
namespace Api\Controller;
use Think\Controller;
class IndexController extends PublicController {
  //***************************
  //  首页数据接口
  //***************************
    public function index(){
      //如果缓存首页没有数据，那么就读取数据库
      /***********获取首页顶部轮播图************/
      $focus=M('focus')->order('sort desc,id asc')->field('id,name,photo')->limit(10)->select();

      foreach ($focus as $k => $v) {
        $focus[$k]['photo']=__DATAURL__.$v['photo'];
        $focus[$k]['name']=urlencode($v['name']);
      }
      /***********获取首页顶部轮播图 end************/

      //======================
      //首页推荐品牌 20个
      //======================
      $brand = M('brand')->where('1=1')->field('id,name,photo')->limit(20)->select();
      foreach ($brand as $k => $v) {
        $brand[$k]['photo'] = __DATAURL__.$v['photo'];
      }

      $qz=C('DB_PREFIX'); // 前缀

      //======================
      //首页推荐产品
      //======================
      $pro_list = M('product')->where('del=0 AND pro_type=1 AND is_down=0 AND '.$qz.'product.type=1')->join('LEFT JOIN __BRAND__ ON __PRODUCT__.brand_id=__BRAND__.id')->order('sort desc,id desc')->field(''.$qz.'product.id,'.$qz.'product.name,intro,photo_x,price_yh,price,company,shiyong,'.$qz.'brand.name as brand')->limit(8)->select();
      foreach ($pro_list as $k => $v) {
        $pro_list[$k]['photo_x'] = __DATAURL__.$v['photo_x'];
      }

      //======================
      //首页分类 自己组建数组
      //======================
      $indeximg = M('indeximg')->order('sort asc')->select();

      foreach ($indeximg as $k => $v) {
        $indeximg[$k]['photo'] = __DATAURL__.$v['photo'];
      }

      $messages = array();
      $data = M("message")->field('message')->select();

      foreach ($data as $k => $v) {
        array_push($messages, $v['message']);
      }

      echo json_encode(array('focus'=>$focus,'procat'=>$indeximg,'prolist'=>$pro_list,'brand'=>$brand, 'messages'=>$messages));
      exit();
    }

    //***************************
    //  首页产品 分页
    //***************************
    public function getlist(){
      $page = intval($_REQUEST['page']);
      $limit = intval($page*8)-8;
      $limit = $limit>0 ? $limit :0;

      $qz=C('DB_PREFIX'); // 前缀

      $pro_list = M('product')->where('del=0 AND pro_type=1 AND is_down=0 AND '.$qz.'product.type=1')->join('LEFT JOIN __BRAND__ ON __PRODUCT__.brand_id=__BRAND__.id')->order('sort desc,id desc')->field(''.$qz.'product.id,'.$qz.'product.name,photo_x,price_yh,price,company,shiyong,'.$qz.'brand.name as brand')->limit($limit.',8')->select();
      foreach ($pro_list as $k => $v) {
        $pro_list[$k]['photo_x'] = __DATAURL__.$v['photo_x'];
      }

      echo json_encode(array('prolist'=>$pro_list));
      exit();
    }

    public function ceshi(){
        $str = null;
        $strPol = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
        $max = strlen($strPol)-1;

        for($i=0;$i<32;$i++){
            $str.=$strPol[rand(0,$max)];//rand($min,$max)生成介于min和max两个数之间的一个随机整数
        }

        echo $str;
    }

    public function ordermsg(){
      $t = intval($_REQUEST['time']);

      if (!$t or $t == 0) {
        $t = time() - 300;
      }

      $orders=M("order");
      $orderp=M("order_product");
      $users=M("user");

      $order = $orders->where('addtime>'.$t)->field('id,uid')->select();

      $order_list = array();

      foreach ($order as $n=>$v) {
        $username = $users->where('id='.intval($v['uid']))->getField('name');
        $prolist = $orderp->where('order_id='.intval($v['id']))->field('name')->select();

        foreach ($prolist as $m=>$x) {
          $arr = array();
          $arr['username'] = $username;
          $arr['productname'] = $x['name'];

          array_push($order_list, $arr);
        }
      }

      echo json_encode(array('time'=>time(), 'order'=>$order_list));
      exit();
    }
}