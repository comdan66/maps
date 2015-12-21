<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 OA Wu Design
 */

class PolylineCoverImageUploader extends OrmImageUploader {

  public function getVersions () {
    return array (
        '' => array (),
        '640x640c' => array ('adaptiveResizeQuadrant', 640, 640, 'c'),
      );
  }
}