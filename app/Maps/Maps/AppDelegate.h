//
//  AppDelegate.h
//  Maps
//
//  Created by OA Wu on 2015/12/22.
//  Copyright © 2015年 OA Wu. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <CoreData/CoreData.h>
#import "Header.h"
#import "ORM.h"
#import "PathGPS.h"

@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property (strong, nonatomic) UIWindow *window;

@property (readonly, strong, nonatomic) NSManagedObjectContext *managedObjectContext;
@property (readonly, strong, nonatomic) NSManagedObjectModel *managedObjectModel;
@property (readonly, strong, nonatomic) NSPersistentStoreCoordinator *persistentStoreCoordinator;
@property UIView *addStatusBar;

- (void)saveContext;
- (NSURL *)applicationDocumentsDirectory;

@end

