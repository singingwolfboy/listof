/*Connect to database*/
\connect listof



/*Create table user group*/
CREATE TABLE base.sys_user_group_membership (
    id SERIAL PRIMARY KEY
  , created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  , created_by_id INTEGER DEFAULT base.get_current_user_id() REFERENCES base.sys_user(id)
  , user_group_id INTEGER NOT NULL DEFAULT 1 REFERENCES base.sys_user_group(id)
  , user_id INTEGER NOT NULL REFERENCES base.sys_user(id)
  , CONSTRAINT user_group_membership_uniqueness UNIQUE (user_group_id, user_id)
);

COMMENT ON TABLE base.sys_user_group_membership IS
'User group memberships connect users to user groups.';



/*Create function to grant user group role to user*/
CREATE OR REPLACE FUNCTION base.grant_user_group()
RETURNS TRIGGER AS $$
BEGIN
    EXECUTE 'GRANT user_group_' || NEW.user_group_id || ' TO user_' || NEW.user_id;
    RETURN NEW;
END;
$$ language plpgsql;

COMMENT ON FUNCTION base.grant_user_group IS
'Function used to automatically grant a user group to a user.';



/*Create function to revoke user group role to user*/
CREATE OR REPLACE FUNCTION base.revoke_user_group()
RETURNS TRIGGER AS $$
BEGIN
    EXECUTE 'REVOKE user_group_' || OLD.user_group_id || ' FROM user_' || OLD.user_id;
    RETURN OLD;
END;
$$ language plpgsql;

COMMENT ON FUNCTION base.revoke_user_group IS
'Function used to automatically revoke a user group from a user.';



/*Triggers on insert*/
CREATE TRIGGER user_group_membership_grant_user_group AFTER INSERT
ON base.sys_user_group_membership FOR EACH ROW EXECUTE PROCEDURE
base.grant_user_group();



/*Triggers on delete*/
CREATE TRIGGER user_group_membership_revoke_user_group BEFORE DELETE
ON base.sys_user_group_membership FOR EACH ROW EXECUTE PROCEDURE
base.revoke_user_group();



/*Create default user group user*/
INSERT INTO base.sys_user_group_membership (user_group_id, user_id) VALUES (1, 1);