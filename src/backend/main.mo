import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Mixin "blob-storage/Mixin";

persistent actor MissionJeet {

  include Mixin();

  // ---- Types ----

  type Subject = {
    id : Nat;
    name : Text;
    batchType : Text;
    displayOrder : Nat;
  };

  type Video = {
    id : Nat;
    title : Text;
    description : Text;
    videoUrl : Text;
    subjectId : Nat;
    displayOrder : Nat;
    createdAt : Int;
  };

  // ---- Stable State ----

  var logoUrl : Text = "";
  var subjects : [Subject] = [];
  var videos : [Video] = [];
  var nextSubjectId : Nat = 1;
  var nextVideoId : Nat = 1;

  var sessionToken : Text = "";
  var sessionExpiry : Int = 0;

  // ---- Auth Helpers ----

  let ADMIN_USER = "admin";
  let ADMIN_PASS = "missionjeet@admin";
  let TOKEN_DURATION_NS : Int = 86_400_000_000_000;

  func generateToken() : Text {
    "mjtoken_" # Time.now().toText();
  };

  func isValidToken(token : Text) : Bool {
    if (token == "") return false;
    if (token != sessionToken) return false;
    Time.now() < sessionExpiry;
  };

  // ---- Admin Auth ----

  public func adminLogin(username : Text, password : Text) : async { #ok : Text; #err : Text } {
    if (username == ADMIN_USER and password == ADMIN_PASS) {
      let token = generateToken();
      sessionToken := token;
      sessionExpiry := Time.now() + TOKEN_DURATION_NS;
      #ok(token);
    } else {
      #err("Invalid credentials");
    };
  };

  public func adminLogout(token : Text) : async { #ok; #err : Text } {
    if (isValidToken(token)) {
      sessionToken := "";
      sessionExpiry := 0;
      #ok;
    } else {
      #err("Invalid or expired session");
    };
  };

  public query func verifyToken(token : Text) : async Bool {
    isValidToken(token);
  };

  // ---- Logo ----

  public query func getLogoUrl() : async Text {
    logoUrl;
  };

  public func setLogoUrl(token : Text, url : Text) : async { #ok; #err : Text } {
    if (not isValidToken(token)) return #err("Unauthorized");
    logoUrl := url;
    #ok;
  };

  // ---- Subjects ----

  public query func getSubjectsByBatch(batchType : Text) : async [Subject] {
    let filtered = subjects.filter(func(s : Subject) : Bool { s.batchType == batchType });
    filtered.sort(func(a : Subject, b : Subject) : {#less; #greater; #equal} {
      if (a.displayOrder < b.displayOrder) #less
      else if (a.displayOrder > b.displayOrder) #greater
      else #equal
    });
  };

  public query func getSubjectById(id : Nat) : async ?Subject {
    subjects.find(func(s : Subject) : Bool { s.id == id });
  };

  public func addSubject(token : Text, name : Text, batchType : Text, displayOrder : Nat) : async { #ok : Subject; #err : Text } {
    if (not isValidToken(token)) return #err("Unauthorized");
    if (batchType != "JEE" and batchType != "NEET") return #err("Invalid batch type");
    let subject : Subject = {
      id = nextSubjectId;
      name = name;
      batchType = batchType;
      displayOrder = displayOrder;
    };
    nextSubjectId += 1;
    subjects := subjects.concat([subject]);
    #ok(subject);
  };

  public func editSubject(token : Text, id : Nat, name : Text, batchType : Text, displayOrder : Nat) : async { #ok : Subject; #err : Text } {
    if (not isValidToken(token)) return #err("Unauthorized");
    if (batchType != "JEE" and batchType != "NEET") return #err("Invalid batch type");
    var found = false;
    var updated : Subject = { id = 0; name = ""; batchType = ""; displayOrder = 0 };
    subjects := subjects.map(func(s : Subject) : Subject {
      if (s.id == id) {
        let u : Subject = { id = id; name = name; batchType = batchType; displayOrder = displayOrder };
        found := true;
        updated := u;
        u;
      } else s;
    });
    if (found) #ok(updated) else #err("Subject not found");
  };

  public func deleteSubject(token : Text, id : Nat) : async { #ok; #err : Text } {
    if (not isValidToken(token)) return #err("Unauthorized");
    let before = subjects.size();
    subjects := subjects.filter(func(s : Subject) : Bool { s.id != id });
    videos := videos.filter(func(v : Video) : Bool { v.subjectId != id });
    if (subjects.size() < before) #ok else #err("Subject not found");
  };

  // ---- Videos ----

  public query func getVideosBySubject(subjectId : Nat) : async [Video] {
    let filtered = videos.filter(func(v : Video) : Bool { v.subjectId == subjectId });
    filtered.sort(func(a : Video, b : Video) : {#less; #greater; #equal} {
      if (a.displayOrder < b.displayOrder) #less
      else if (a.displayOrder > b.displayOrder) #greater
      else #equal
    });
  };

  public query func getVideoById(id : Nat) : async ?Video {
    videos.find(func(v : Video) : Bool { v.id == id });
  };

  public func addVideo(token : Text, title : Text, description : Text, videoUrl : Text, subjectId : Nat, displayOrder : Nat) : async { #ok : Video; #err : Text } {
    if (not isValidToken(token)) return #err("Unauthorized");
    let subjectExists = subjects.find(func(s : Subject) : Bool { s.id == subjectId });
    switch (subjectExists) {
      case (null) { return #err("Subject not found") };
      case (?_) {};
    };
    let video : Video = {
      id = nextVideoId;
      title = title;
      description = description;
      videoUrl = videoUrl;
      subjectId = subjectId;
      displayOrder = displayOrder;
      createdAt = Time.now();
    };
    nextVideoId += 1;
    videos := videos.concat([video]);
    #ok(video);
  };

  public func editVideo(token : Text, id : Nat, title : Text, description : Text, videoUrl : Text, subjectId : Nat, displayOrder : Nat) : async { #ok : Video; #err : Text } {
    if (not isValidToken(token)) return #err("Unauthorized");
    var found = false;
    var updated : Video = { id = 0; title = ""; description = ""; videoUrl = ""; subjectId = 0; displayOrder = 0; createdAt = 0 };
    videos := videos.map(func(v : Video) : Video {
      if (v.id == id) {
        let u : Video = {
          id = id;
          title = title;
          description = description;
          videoUrl = videoUrl;
          subjectId = subjectId;
          displayOrder = displayOrder;
          createdAt = v.createdAt;
        };
        found := true;
        updated := u;
        u;
      } else v;
    });
    if (found) #ok(updated) else #err("Video not found");
  };

  public func deleteVideo(token : Text, id : Nat) : async { #ok; #err : Text } {
    if (not isValidToken(token)) return #err("Unauthorized");
    let before = videos.size();
    videos := videos.filter(func(v : Video) : Bool { v.id != id });
    if (videos.size() < before) #ok else #err("Video not found");
  };

  public query func getAllSubjects() : async [Subject] {
    subjects;
  };

  public query func getAllVideos() : async [Video] {
    videos;
  };
};
